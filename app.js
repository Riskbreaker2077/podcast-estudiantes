async function loadEpisodes() {
  const list = document.querySelector('#episode-list');
  const response = await fetch('assets/episodes.json');
  const episodes = await response.json();
  list.innerHTML = episodes.map((episode) => {
    const image = episode.image || `images/episode-${String(episode.id).padStart(2, '0')}.jpg`;
    const names = episode.names.join(' · ');
    return `
      <article class="episode" data-id="${episode.id}">
        <div class="episode-number">${String(episode.id).padStart(2, '0')}</div>
        <img class="episode-cover" src="${image}" alt="Imagen del episodio: ${escapeHtml(episode.title)}" loading="lazy">
        <div class="episode-info">
          <h3>${escapeHtml(episode.title)}</h3>
          <p class="names">${escapeHtml(names)}</p>
          <p class="duration">${episode.minutes} min · episodio ${String(episode.id).padStart(2, '0')}</p>
        </div>
        <div class="episode-tools">
          <button class="play" type="button" aria-label="Reproducir ${escapeHtml(episode.title)}">▶</button>
          <audio preload="none" controls src="${episode.audio}"></audio>
          <button class="script-link" type="button">Leer guion</button>
        </div>
        <div class="script-panel" id="script-${episode.id}"></div>
      </article>`;
  }).join('');

  document.querySelectorAll('.play').forEach((button) => {
    button.addEventListener('click', () => {
      const audio = button.closest('.episode').querySelector('audio');
      document.querySelectorAll('audio').forEach((other) => { if (other !== audio) other.pause(); });
      if (audio.paused) { audio.play(); button.classList.add('active'); button.textContent = 'Ⅱ'; }
      else { audio.pause(); button.classList.remove('active'); button.textContent = '▶'; }
      audio.addEventListener('ended', () => { button.classList.remove('active'); button.textContent = '▶'; }, { once: true });
    });
  });
  document.querySelectorAll('.script-link').forEach((button, index) => {
    button.addEventListener('click', async () => {
      const episode = episodes[index];
      const panel = document.querySelector(`#script-${episode.id}`);
      if (!panel.classList.contains('open')) {
        if (!panel.textContent) panel.textContent = await fetch(episode.script).then((r) => r.text());
        panel.classList.add('open'); button.textContent = 'Cerrar guion';
      } else { panel.classList.remove('open'); button.textContent = 'Leer guion'; }
    });
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}
loadEpisodes().catch(() => { document.querySelector('#episode-list').textContent = 'No se pudieron cargar los episodios.'; });
