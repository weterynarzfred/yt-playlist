import { post } from './api';
import { displayText } from './console';
import { formatTime, parseTime } from './time';

export default class Video {
  constructor(element) {
    this.element = element;
    this.titleElement = element.querySelector('.video-title');
    this.editButton = element.querySelector('.video-edit');
    this.id = element.dataset.id;
    this.videoId = element.dataset.videoid;
    this.title = element.dataset.title;
    this.startTime = element.dataset.starttime;
    this.endTime = element.dataset.endtime;
    this.filtered = false;
  }

  async update(changes) {
    Object.assign(this, changes);
    this.titleElement.textContent = this.title || '???';
    displayText(`update to title ${this.title} queued`);
    const response = await post('update', {
      ID: this.id,
      data: JSON.stringify({ title: this.title, startTime: this.startTime, endTime: this.endTime }),
    });
    displayText(`update to title ${this.title} ${response === 'success' ? 'successful' : 'failed'}`);
  }

  toggleEditor() {
    this.form ? this.closeEditor() : this.openEditor();
  }

  openEditor() {
    this.form = document.createElement('form');
    this.form.className = 'title-edit';
    this.form.innerHTML = `
      <input name="title" placeholder="title" autocomplete="off">
      <input name="startTime" placeholder="start time, minutes:seconds" autocomplete="off">
      <input name="endTime" placeholder="end time, minutes:seconds" autocomplete="off">
      <input type="submit" value="save">`;
    const { title, startTime, endTime } = this.form.elements;
    title.value = this.title;
    startTime.value = formatTime(this.startTime);
    endTime.value = formatTime(this.endTime);

    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.update({
        title: title.value,
        startTime: parseTime(startTime.value),
        endTime: parseTime(endTime.value),
      });
      this.closeEditor();
    });

    // The edit button is excluded so its own click can toggle the editor closed.
    this.closeOnOutsideClick = event => {
      if (!this.form.contains(event.target) && event.target !== this.editButton) this.closeEditor();
    };
    document.addEventListener('pointerdown', this.closeOnOutsideClick);

    this.element.append(this.form);
    title.focus();
  }

  closeEditor() {
    document.removeEventListener('pointerdown', this.closeOnOutsideClick);
    this.form.remove();
    this.form = null;
  }
}
