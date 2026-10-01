import { post } from './api';
import { displayText } from './console';
import { formatTime, parseTime } from './time';

export default class Video {
  constructor(element) {
    this.element = element;
    this.titleElement = element.querySelector('.video-title');
    this.id = element.dataset.id;
    this.videoId = element.dataset.videoid;
    this.title = element.dataset.title;
    this.startTime = element.dataset.starttime;
    this.endTime = element.dataset.endtime;
    this.filtered = false;
  }

  get data() {
    return { title: this.title, startTime: this.startTime, endTime: this.endTime };
  }

  get label() {
    return this.title || this.videoId;
  }

  // Returns whether the change was saved.
  async update(changes) {
    Object.assign(this, changes);
    this.titleElement.textContent = this.title || '???';
    const response = await post('update', { ID: this.id, data: JSON.stringify(this.data) });
    if (response !== 'success') displayText(`saving ${this.label} failed`);
    return response === 'success';
  }

  openEditor(onSave) {
    if (this.form) return;
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
      onSave({
        title: title.value,
        startTime: parseTime(startTime.value),
        endTime: parseTime(endTime.value),
      });
      this.closeEditor();
    });

    this.closeOnOutsideClick = event => {
      if (!this.form.contains(event.target)) this.closeEditor();
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
