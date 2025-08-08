document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);

  const styles = `
    .icon-fab {
      position: fixed;
      left: 0px;
      bottom: 0px;
      z-index: 10000;
      border: none;
      padding: 10px 18px;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,.2);
      background: var(--dark, var(--color-surface-elevated, #f00));
      color: #fff;
    }
    .icon-fab:focus-visible { outline: 3px solid rgba(74,108,247,.5); }
    .icon-overlay{
      position:fixed; inset:0;
      display:none; place-items:center;
      background:rgba(0,0,0,.9);
      z-index:999999999999999; padding:24px;
    }
    .icon-overlay[aria-hidden="false"]{ display:grid; }
    .icon-modal{
      background:var(--light, #fff);
      color:var(--dark, #111);
      border-radius:16px;
      box-shadow:0 10px 30px rgba(0,0,0,.35);
      width: max-content;
      max-height: min(90vh, 900px);
      overflow:auto;
      padding:24px 16px 28px;
      position:relative;
    }
    .icon-modal h2{
      margin:0 0 12px; font-size:20px; 
      color:var(--dark, var(--color-surface-elevated, #f00));
      padding:0 8px;
    }
    .icon-modal .close{
      position:absolute; top:10px; right:10px;
      background:transparent; border:none;
      font-size:22px; line-height:1; cursor:pointer;
    }
    ul.icon-grid{
      display:grid!important;
      grid-template-columns: repeat(6, 1fr);
      gap:12px;
      list-style:none; margin:0; padding:8px;
    }
    .icon-card{
      text-align:center;
      border:1px solid var(--dark, var(--color-surface-elevated, #f00));
      border-radius:12px;
      background-color:var(--light, var(--color-background, #fff));
      box-shadow:0 4px 6px rgba(0,0,0,.08);
      transition:transform .15s ease, box-shadow .15s ease;
      cursor:pointer; user-select:none;
      aspect-ratio: 1 / 1;
      width: 120px;
      display: flex;
      padding: 1rem!important;
      justify-content: center;
      align-items: center;
    }
    .icon-card:hover{ transform:translateY(-2px); box-shadow:0 8px 15px rgba(0,0,0,.15); }
    .icon-card i{ font-size:30px; color:var(--dark, var(--color-surface-elevated, #222)); display:block; }
    .icon-card p{ margin:10px 0 0; font-size:14px; color:var(--dark, var(--color-surface-elevated, #f00)); font-weight:700; word-break:break-word; }
    .icon-card::before{ content:none!important; }
    @media (prefers-reduced-motion: reduce){
      .icon-card{ transition:none; }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);

  const fab = document.createElement('button');
  fab.className = 'icon-fab';
  fab.id = 'openIconOverlay';
  fab.type = 'button';
  fab.setAttribute('aria-haspopup', 'dialog');
  fab.setAttribute('aria-controls', 'iconOverlay');
  fab.textContent = 'Icons anzeigen';
  document.body.appendChild(fab);

  const overlay = document.createElement('div');
  overlay.className = 'icon-overlay';
  overlay.id = 'iconOverlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const modal = document.createElement('div');
  modal.className = 'icon-modal';
  modal.setAttribute('role', 'document');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'close';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Schließen');
  closeBtn.textContent = '✕';

  const title = document.createElement('h2');
  title.textContent = 'IconMap – Test';

  const grid = document.createElement('ul');
  grid.className = 'icon-grid';
  grid.id = 'iconGrid';
  grid.setAttribute('aria-label', 'Icon-Auswahl');

  modal.appendChild(closeBtn);
  modal.appendChild(title);
  modal.appendChild(grid);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  async function copySilently(text){
    try{
      if (navigator.clipboard && window.isSecureContext){
        await navigator.clipboard.writeText(text);
      }else{
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position='fixed';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
    }catch(e){}
  }

  const OverlayCtrl = (() => {
    let lastFocus = null;
    function open(){
      lastFocus = document.activeElement;
      overlay.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
      document.addEventListener('keydown', onKeydown);
      overlay.addEventListener('click', onBackdrop);
      closeBtn.focus();
    }
    function close(){
      overlay.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
      document.removeEventListener('keydown', onKeydown);
      overlay.removeEventListener('click', onBackdrop);
      if (lastFocus) lastFocus.focus();
    }
    function onKeydown(e){ if (e.key === 'Escape') close(); }
    function onBackdrop(e){ if (e.target === overlay) close(); }
    return { open, close };
  })();

  const iconMap = Object.keys((window.cssData && cssData['icon-map']) || {});
  const frag = document.createDocumentFragment();
  iconMap.forEach(icon => {
    const li = document.createElement('li');
    li.className = 'icon-card';
    li.dataset.icon = icon;
    li.innerHTML = `<i class="icon icon-${icon}" aria-hidden="true"></i><p>${icon}</p>`;
    li.setAttribute('role','button');
    li.setAttribute('tabindex','0');
    li.setAttribute('aria-label', `Icon ${icon} kopieren`);
    frag.appendChild(li);
  });
  grid.appendChild(frag);

  grid.addEventListener('click', e => {
    const card = e.target.closest('.icon-card');
    if (card) copySilently(card.dataset.icon);
  });
  grid.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('.icon-card')) {
      e.preventDefault();
      copySilently(e.target.closest('.icon-card').dataset.icon);
    }
  });
  fab.addEventListener('click', () => OverlayCtrl.open());
  closeBtn.addEventListener('click', () => OverlayCtrl.close());
});