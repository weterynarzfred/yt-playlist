function parseInput(input, def) {
  return typeof input === 'undefined' ? def : input;
}

var nextID = 0;
var tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
var currentID = -1;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function onPlayerReady(event) {
  randomize();
  loadNext();
}

function onPlayerStateChange(event) {
  if (event.data === 1) {
    if (!videos[currentID].titleChecked) {
      videos[currentID].updateVideo({ title: player.getVideoData().title });
    } else if (videos[currentID].title.search(/\[error [0-9]+\]/) !== -1) {
      const newTitle = videos[currentID].title.replace(/ \[error [0-9]+\]/, '');
      videos[currentID].updateVideo({ title: newTitle });
    }
    document.title = videos[currentID].title;
  }
  if (event.data === 0 && player.getCurrentTime() > 0) {
    loadNext();
  }
}
function onPlayerError(event) {
  if (videos[currentID].title.search(/\[error [0-9]+\]/) === -1) {
    videos[currentID].updateVideo({
      title: `${videos[currentID].title} [error ${+event.data}]`,
    });
  }
  loadNext();
}

function loadNext(arrayID) {
  if (videos[currentID] !== undefined && videos[currentID].stopAfter) return;
  if (
    videos[currentID] !== void 0 &&
    !videos[currentID].removed &&
    !videos[currentID].filtered
  ) {
    videos[currentID].obj.removeClass('current');
  }
  if (typeof arrayID !== 'number') {
    currentID = (currentID + 1) % videos.length;
  } else currentID = arrayID;
  if (videos[currentID].removed || videos[currentID].filtered) {
    loadNext();
    return;
  }

  const videoData = {
    videoId: videos[currentID].videoId,
  };
  if (videos[currentID].startTime) {
    videoData.startSeconds = videos[currentID].startTime;
  }
  if (videos[currentID].endTime) {
    videoData.endSeconds = videos[currentID].endTime;
  }
  player.loadVideoById(videoData);
  videos[currentID].obj.addClass('current');
  displayText(videos[currentID].title + ' started playing');
}

function Video(e) {
  var t = this;
  t.obj = $(e);
  t.arrayID = nextID++;
  t.tit = t.obj.find('.video-title');
  t.edit = t.obj.find('.video-edit');
  t.del = t.obj.find('.video-delete');
  t.next = t.obj.find('.video-play-next');
  t.id = parseInput(t.obj.attr('data-ID'), '');
  t.videoId = parseInput(t.obj.attr('data-videoID'), '');
  t.title = parseInput(t.obj.attr('data-title'), '');
  t.titleChecked = t.title !== '';
  t.form;
  t.removed = false;
  t.filtered = false;
  t.random = Math.random();
  t.stopAfter = false;

  t.startTime = parseInput(t.obj.data('starttime'), '');
  t.endTime = parseInput(t.obj.data('endtime'), '');

  t.tit.click(function () {
    loadNext(t.arrayID);
  });

  t.edit.click(function (e) {
    e.stopPropagation();
    if (t.form !== undefined) {
      t.removeTitleEdit();
    } else {
      t.form = $(document.createElement('form')).addClass('title-edit');
      const titleInput = $(document.createElement('input'))
        .attr({
          type: 'text',
          name: 'title',
          placeholder: 'title',
          autocomplete: 'off',
        })
        .val(t.title)
        .appendTo(t.form);
      const startTimeInput = $(document.createElement('input'))
        .attr({
          type: 'text',
          name: 'startTime',
          placeholder: 'start time, minutes:seconds',
          autocomplete: 'off',
        })
        .val(timeToDisplay(t.startTime))
        .appendTo(t.form);
      const endTimeInput = $(document.createElement('input'))
        .attr({
          type: 'text',
          name: 'endTime',
          placeholder: 'end time, minutes:seconds',
          autocomplete: 'off',
        })
        .val(timeToDisplay(t.endTime))
        .appendTo(t.form);
      $(document.createElement('input'))
        .attr({
          type: 'submit',
          value: 'save',
        })
        .appendTo(t.form);
      t.form.submit(function (e) {
        e.preventDefault();
        t.updateVideo({
          title: titleInput.val(),
          startTime: timeToRaw(startTimeInput.val()),
          endTime: timeToRaw(endTimeInput.val()),
        });
        t.removeTitleEdit();
        return false;
      });
      t.form.on('click', e => e.stopPropagation());
      $(document).on('click.form', () => {
        t.removeTitleEdit();
        $(document).off('click.form');
      });
      t.obj.append(t.form);
      titleInput.focus();
    }
  });

  t.del.click(function () {
    // ----- delete
    startLoadAnimation();
    displayText('deletion of ' + t.title + ' queued');
    var d = {
      ID: t.id,
      action: 'delete',
    };
    $.ajax({
      method: 'POST',
      url: './sql.php',
      data: d,
    }).done(function (rsp) {
      stopLoadAnimation();
      if (rsp == 'success') {
        displayText('deletion of ' + t.title + ' successful');
        t.obj.remove();
        t.removed = true;
      } else {
        displayText('deletion of ' + t.title + ' failed');
      }
    });
  });

  t.next.click(function () {
    playNext(t.arrayID);
  });

  t.removeTitleEdit = function () {
    if (t.form != void 0) {
      t.form.remove();
      t.form = void 0;
    }
  };

  t.updateVideo = function (data) {
    if (data.title === undefined) {
      data.title = t.title;
    }
    if (data.startTime === undefined) {
      data.startTime = t.startTime;
    }
    if (data.endTime === undefined) {
      data.endTime = t.endTime;
    }
    t.obj.attr({ 'data-title': data.title });
    t.tit.text(data.title);
    t.title = data.title;
    t.titleChecked = t.title !== '';
    t.endTime = data.endTime;
    t.startTime = data.startTime;
    t.ajaxUpdate(data);
  };

  t.ajaxUpdate = function (data) {
    // ----- update
    startLoadAnimation();
    displayText('update to title ' + t.title + ' queued');
    const d = {
      ID: t.id,
      data: JSON.stringify(data),
      action: 'update',
    };
    $.ajax({
      method: 'POST',
      url: './sql.php',
      data: d,
    }).done(function (rsp) {
      stopLoadAnimation();
      if (rsp === 'success') {
        displayText('update to title ' + t.title + ' successful');
      } else {
        displayText('update to title ' + t.title + ' failed');
      }
    });
  };
}

$('form.add-form').submit(function (e) {
  e.preventDefault();
  var t = $(this);
  let videoId = t.find('.add-video').val();
  if (videoId.search('v=') >= 0) {
    const match = videoId.match(/v=([a-zA-Z0-9-_]+)/);
    if (match) videoId = match[1];
  }

  // ----- add new
  startLoadAnimation();
  displayText('video with ID: ' + videoId + ' queued');
  var d = {
    videoID: videoId,
    playlistID: $('#playlist').attr('data-playlistID'),
    action: 'insert',
  };
  $.ajax({
    method: 'POST',
    url: './sql.php',
    data: d,
  }).done(function (rsp) {
    stopLoadAnimation();
    if (rsp[0] == 's') {
      $('#playlist').append(rsp.replace('s', ''));
      videos.push(new Video($('.video').eq(-1)));
      displayText('video with ID: ' + videoId + ' added successfully');
    } else {
      displayText('video with ID: ' + videoId + ' failed to be added');
    }
    $('.add-form input').val('');
  });
  return false;
});

var videos = $('#playlist .video').map(function (i, e) {
  return new Video(e, i);
});

function reorderVideos() {
  let isCurrentIDCorrect = false;
  videos.map(function (i, e) {
    e.random = Math.random();
    if (!e.removed && !e.filtered) {
      $('#playlist').append(e.obj);
      if (!isCurrentIDCorrect && e.arrayID === currentID) {
        currentID = i;
        isCurrentIDCorrect = true;
      }
    }
    e.arrayID = i;
  });
}

function randomize() {
  $('#playlist .video').detach();
  videos.sort(function (a, b) {
    return b.random - a.random;
  });
  reorderVideos();
}

function sortByName() {
  $('#playlist .video').detach();
  videos.sort(function (a, b) {
    return a.title.localeCompare(b.title);
  });
  reorderVideos();
}

function playNext(id) {
  if (id > currentID) {
    videos.splice(currentID + 1, 0, videos.splice(id, 1)[0]);
  } else if (id < currentID) {
    videos.splice(currentID, 0, videos.splice(id, 1)[0]);
  }
  reorderVideos();
}

$('#randomize').click(randomize);
$('#sort').click(sortByName);
$('#next').click(loadNext);

// inapp console
loadingCount = 0;
function startLoadAnimation() {
  loadingCount++;
  if (loadingCount == 1) {
    $('#load-icon').fadeIn();
  }
}
function stopLoadAnimation() {
  loadingCount--;
  if (loadingCount == 0) {
    $('#load-icon').fadeOut();
  }
}
function displayText(text) {
  var element = $(document.createElement('div')).text(text);
  $('#console').append(element);
  setTimeout(function () {
    element.fadeOut(function () {
      $(this).remove();
    });
  }, 5000);
}

// filtering
function applyFilter() {
  const s = new RegExp(filter.val(), 'i');
  videos.map(function (i, e) {
    if (!s.test(e.title)) {
      e.filtered = true;
    } else {
      e.filtered = false;
    }
  });
  sortByName();
}

const filter = $('#filter');
let filterTimeout;
if (filter.length > 0) {
  filter.on({
    keyup: applyFilter,
    focus: () => {
      clearTimeout(filterTimeout);
      searchesWrap.slideDown(200);
    },
    blur: () => {
      filterTimeout = setTimeout(() => {
        searchesWrap.slideUp(200);
      }, 100);
    },
  });
}

// save search
const searchesWrap = $('#searches-wrap');
const searchesList = $('#search-list');
const searchesElement = $('#searches');
const searches = searchesElement.data('searches');

$('#search-save').on('click', event => {
  filter.focus();
  startLoadAnimation();
  displayText('saving search query');
  if (!filter.val()) {
    stopLoadAnimation();
    displayText('cannot save empty search');
    return;
  }
  searches.push(filter.val());
  const d = {
    playlistID: $('#playlist').attr('data-playlistID'),
    action: 'saveSearch',
    data: JSON.stringify(searches),
  };
  $.ajax({
    method: 'POST',
    url: './sql.php',
    data: d,
  }).done(function (rsp) {
    stopLoadAnimation();
    if (rsp[0] === 's') {
      displayText('search query saved');
      const newSearch = $(
        '<div class="search"><div class="search-delete"></div></div>'
      ).data({ 'search-id': searches.length - 1 });
      $('<div class="search-title"></div>')
        .data({ filter: filter.val() })
        .text(filter.val())
        .appendTo(newSearch);
      searchesElement.append(newSearch);
    } else {
      displayText('saving search query failed');
    }
  });
});

searchesElement.on('click', '.search-title', event => {
  filter.focus();
  filter.val($(event.currentTarget).data('filter'));
  applyFilter();
});

searchesElement.on('click', '.search-delete', event => {
  filter.focus();
  startLoadAnimation();
  displayText('removing search query');
  const target = $(event.currentTarget);
  const index = searches.indexOf(
    target.siblings('.search-title').data('filter')
  );
  if (index === -1) return;
  searches.splice(index, 1);

  const d = {
    playlistID: $('#playlist').attr('data-playlistID'),
    action: 'saveSearch',
    data: JSON.stringify(searches),
  };
  $.ajax({
    method: 'POST',
    url: './sql.php',
    data: d,
  }).done(function (rsp) {
    stopLoadAnimation();
    if (rsp[0] === 's') {
      displayText('search query removed');
      target.parents('.search').remove();
    } else {
      displayText('removing search query failed');
    }
  });
});

// time operations
function timeToRaw(time) {
  if (time.search(/[0-9]+:[0-9]+/) >= 0) {
    return time.replace(/([0-9]+):([0-9]+)/, (match, minutes, seconds) => {
      return parseInt(minutes) * 60 + parseInt(seconds);
    });
  }
  time = parseInt(time);
  if (isNaN(time)) return '';
  return time;
}

function timeToDisplay(time) {
  time = parseInt(time);
  if (isNaN(time)) return '';
  if (time < 60) return time;
  let seconds = time % 60;
  if (seconds < 10) seconds = '0' + seconds;
  return Math.floor(time / 60) + ':' + seconds;
}

// nav
$('#delete-toggle').on('click', event => {
  $('body').toggleClass('delete-active');
});

$(document).on('click', '.video-id', event => {
  const videoID = $(event.currentTarget).text();
  const selectedVideo = videos.filter((i, v) => v.videoId === videoID)[0];
  if (selectedVideo.stopAfter) {
    selectedVideo.stopAfter = false;
    selectedVideo.obj.removeClass('video-stopping');
  } else {
    selectedVideo.stopAfter = true;
    selectedVideo.obj.addClass('video-stopping');
  }
});
