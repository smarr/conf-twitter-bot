import { Paper, PaperForTemplate } from "data";
import { afterNDays, formatDateWithTime, getRandomMinute,
  hourMinuteStrToMinutesSinceMidnight, SchedulingConfig } from "./scheduling.js";

declare function html2canvas(div: any): Promise<any>;
declare const Mustache: any;

function readScheduleConfig(): SchedulingConfig {
  const nextDate = new Date(<string>$('#nextDate').val());
  const everyNDays = Number($('#everyNDays').val());
  let earliestTime = hourMinuteStrToMinutesSinceMidnight(<string>$('#earliestHour').val());
  let latestTime = hourMinuteStrToMinutesSinceMidnight(<string>$('#latestHour').val());

  // just in case...
  if (latestTime < earliestTime) {
    const tmp = latestTime;
    latestTime = earliestTime;
    earliestTime = tmp;
  }

  return {
    nextDate, everyNDays,
    earliestTime, latestTime
  };
}

function updateSchedule(): void {
  const config = readScheduleConfig();

  let nextDate = config.nextDate;
  $('.tw-queue-item').each((i, elem) => {
    const nextDateWithTime = new Date(nextDate);
    nextDateWithTime.setMinutes(getRandomMinute(config.earliestTime, config.latestTime));
    $(elem).find('.tw-scheduled-time').text(formatDateWithTime(nextDateWithTime));

    nextDate = afterNDays(nextDate, config.everyNDays);
  });
}

function paperDetails(d: Paper): JQuery<HTMLElement> {
  selectedPaper = d;
  if (!d.fullAbstract) {
    getFullAbstract(d);
  }

  const content = renderPaper(d, $('#picture-tpl').val());

  const paper = `
  <div id="paper-${d.id}">
    <div class="p-details" contenteditable="true">${content}</div>
  </div>`;
  return $(paper);
}

async function renderPaperDetails(paper: Paper): Promise<string> {
  if (!paper.fullAbstract) {
    const response = await fetch(`/paper/${paper.id}`);
    paper = await response.json();
  }

  const content = renderPaper(paper, $('#picture-tpl').val());

  $('#render-image').html(
    `<div class="p-details">${content}</div>`);
  const detailsJQDiv = $('#render-image .p-details');
  const dataUrl = await renderDivToImage(detailsJQDiv[0]);
  detailsJQDiv.remove();
  return dataUrl;
}

async function getFullAbstract(d: Paper) {
  const response = await fetch(`/paper/${d.id}`);
  const paper = <Paper> await response.json();

  if (paper.fullAbstract) {
    $(`#paper-${d.id} .p-abstract`).html(paper.fullAbstract);
  }
}

let paperTable: any = null;
let selectedPaper: Paper | null = null;

function showInQueue(tweetText: string, dataUrl: string, paperId: number): JQuery<HTMLElement> {
  const elem = $(`
    <div class="tw-queue-item" id="tweet-for-paper-${paperId}">
      <div class="tw-scheduled-time"></div>
      <div class="tw-queue-text">${tweetText}</div>
      <div class="tw-queue-img"><img src="${dataUrl}"></div>
    </div>
  `);
  $("#tweet-queue").append(elem);
  return elem;
}

async function queueTweet() {
  if (!selectedPaper) {
    return;
  }

  const dataUrl = await renderPaperDetails(selectedPaper);
  const tweetText = <string>$('#tweet').val();
  const id = <number>selectedPaper.id;

  const elem = showInQueue(tweetText, dataUrl, id);

  const response = await fetch('/queue-tweet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: tweetText,
      image: dataUrl,
      paperId: id
    })
  });
  const result = await response.json();
  if (result.ok) {
    elem.data('tweetId', result.tweet.id);
    updateSchedule();
  }
}

async function renderDivToImage(div: HTMLElement): Promise<string> {
  try {
    const canvas = await html2canvas(div);
    const dataUrl = canvas.toDataURL();
    return dataUrl;
  } catch (error) {
    console.error('Error when rending abstract to image for twitter', error);
    throw error;
  };
}

function togglePaperDetails(this: HTMLElement): void {
  if (!paperTable) { return; }

  const tr = $(this).closest('tr');
  const row = paperTable.row(tr);
  if (!row.data()) {
    return;
  }

  if (row.child.isShown()) {
    row.child.hide();
    tr.removeClass('shown');
  } else {
    const detailsElem = paperDetails(row.data());
    row.child(detailsElem).show();
    tr.addClass('shown');
  }
}

function togglePaperSelected(this: HTMLElement): void {
  if ($(this).hasClass('selected')) {
    $(this).removeClass('selected');
  } else {
    const tr = $(this).closest('tr');
    const row = paperTable.row(tr);

    if (!row.data()) {
      return;
    }

    paperTable.$('tr.selected').removeClass('selected');
    $(this).addClass('selected');
    renderPaperInTemplate(row.data());
  }
}

function renderPaperInTemplate(paper: Paper): void {
  selectedPaper = paper;
  const tweet = renderPaper(paper, <string>$('#tweet-tpl').val());
  $('#tweet').val(tweet);
  tweetLength();
}

function renderPaper(paper: Paper, template: string): string {
  if (template && template.length > 0) {
    const p = <PaperForTemplate>{...paper};
    if (p.fullAbstract) {
      p.abstract = p.fullAbstract;
    } else {
      p.abstract = p.shortAbstract;
    }

    p.fullAuthors = p.authors.join(', ');

    return Mustache.render(template, p);
  }
  return '';
}

function createTable(data: Paper[]): any {
  return $('#papers').DataTable({
    columns: [
      {
        className: 'dt-control',
        orderable: false,
        data: null,
        defaultContent: ''
      },
      {title: "Title",    data: 'title'},
      {title: "Type",     data: 'type',    visible: false},
      {title: "URL",      data: 'url',     visible: false},
      {title: "Authors",  data: d => d.authors.join(', ')},
      {title: "Month",    data: d => d.monthYear.split(' ')[0]},
      {title: "Year",     data: d => d.monthYear.split(' ')[1]},
      {title: "Pages",    data: 'pages',   visible: false},
      {title: "Abstract", data: 'shortAbstract', visible: false},
      {title: "Cites",    data: 'citations'},
      {title: "#Down",    data: 'downloads'}
    ],
    data: data
  });
}

async function loadPapers() {
  const urls = $('#urls').text().trim();
  const response = await fetch('/load-urls', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({urls})
  });

  const data = await response.json();

  paperTable?.destroy();
  paperTable = createTable(<Paper[]>data.papers);

  // Add event listener for opening and closing details
  $('#papers tbody').on('click', 'td.dt-control', togglePaperDetails);
  $('#papers tbody').on('click', 'tr', togglePaperSelected);
}

async function loadTweets() {
  const response = await fetch('/load-queue');
  const data = await response.json();
  if (data.tweets) {
    for (const tweet of data.tweets) {
      const elem = showInQueue(tweet.text, tweet.image, tweet.paperId);
      if (tweet.id) {
        elem.data('tweetId', tweet.id);
      }
    }
  }

  $('#tweet-queue').sortable({
    update: updateSchedule
  });
}

async function loadConfig() {
  const response = await fetch('/configuration');
  const data = await response.json();

  $('#tweet-tpl').val(data?.tweetTpl);
  $('#picture-tpl').val(data?.pictureTpl);
  $('#picture-style').val(data?.pictureStyle);
  $('#tweet-pic-style').text(data?.pictureStyle);
}

async function saveAndApplyConfig() {
  const tweetTpl = <string>$('#tweet-tpl').val();
  const pictureTpl = <string>$('#picture-tpl').val();
  const pictureStyle = <string>$('#picture-style').val();

  $('#tweet-pic-style').text(pictureStyle);

  const response = await fetch('/configuration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tweetTpl, pictureTpl, pictureStyle
    })
  });
  await response.json();
}

function tweetLength() {
  const maxTweetLength = 280;
  let length = (<string>$('#tweet').val()).length;
  $('#tweet-length').text(`${length} / ${maxTweetLength}`);

  length = (<string>$('#tweet-tpl').val()).length;
  $('#tweet-tpl-length').text(`${length} / ${maxTweetLength}`);
}

$(async function(){
  $('#load-btn').click(loadPapers);
  $('#save-config-btn').click(saveAndApplyConfig);
  $('#tweet').keyup(tweetLength);
  $('#tweet-tpl').keyup(tweetLength);
  $('#queue-btn').click(queueTweet);
  $('#everyNDays').spinner({
    change: updateSchedule,
    stop: updateSchedule
  });

  $('#nextDate').change(updateSchedule)
  $('#everyNDays').change(updateSchedule)
  $('#earliestHour').change(updateSchedule);
  $('#latestHour').change(updateSchedule);


  loadTweets();
  await loadConfig();
  tweetLength();
});