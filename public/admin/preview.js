// Живое превью в админке: справа от полей видно, как кейс и страницы выглядят на сайте.
// Разметка повторяет страницы сайта (src/pages, src/components), стили — preview.css.
(function () {
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  CMS.registerPreviewStyle('/admin/preview.css');

  // Поле «Направления (для фильтра)»: выпадающий список с выбором нескольких вариантов.
  // Старые кейсы хранят одно направление строкой (category: ads) — обычный список с multiple
  // показал бы их пустыми, поэтому строку передаём ему как список из одного значения.
  var Select = CMS.getWidget('select');
  if (Select && Select.control) {
    var CategoriesControl = createClass({
      render: function () {
        var v = this.props.value;
        return h(Select.control, Object.assign({}, this.props, { value: typeof v === 'string' && v ? [v] : v }));
      },
    });
    CMS.registerWidget('categories', CategoriesControl, Select.preview);
  }

  // ---------- помощники ----------
  function toJS(v) {
    return v && typeof v.toJS === 'function' ? v.toJS() : v;
  }
  function dataOf(props) {
    return toJS(props.entry.get('data')) || {};
  }
  function url(props, path) {
    if (!path) return null;
    var a = props.getAsset(path);
    return a ? a.toString() : path;
  }
  function lines(text) {
    var parts = String(text || '').replace(/\r\n/g, '\n').replace(/\n+$/, '').split('\n');
    var out = [];
    parts.forEach(function (p, i) {
      if (i) out.push(h('br', { key: 'br' + i }));
      out.push(p);
    });
    return out;
  }
  function arr(v) {
    v = toJS(v);
    return Array.isArray(v) ? v : [];
  }
  function pad2(n) {
    return (n < 10 ? '0' : '') + n;
  }
  // часть страницы шириной 1440 px, уменьшенная под ширину панели превью (подписи не уменьшаются)
  function z(child) {
    return h('div', { className: 'pv-z' }, child);
  }
  function note(title, hint) {
    return h('p', { className: 'pv-note' }, title, hint ? h('small', null, ' — ' + hint) : null);
  }
  function startVideo(e) {
    var v = e.target;
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  // Картинка или видео; пропорции берутся из самого файла, как на сайте
  var Media = createClass({
    getInitialState: function () {
      return { ratio: null };
    },
    setRatio: function (r) {
      if (r && Math.abs(r - (this.state.ratio || 0)) > 0.001) {
        this.setState({ ratio: r });
        if (this.props.onRatio) this.props.onRatio(r);
      }
    },
    onImg: function (e) {
      if (!this.props.video && e.target.naturalWidth) this.setRatio(e.target.naturalWidth / e.target.naturalHeight);
    },
    onVideo: function (e) {
      if (e.target.videoWidth) this.setRatio(e.target.videoWidth / e.target.videoHeight);
      startVideo(e);
    },
    render: function () {
      var p = this.props;
      // как на сайте: нет ни картинки, ни видео — ничего не показываем
      if (!p.src && !p.video) return null;
      return h(
        'figure',
        { className: 'case-image ph', style: { aspectRatio: String(this.state.ratio || p.fallback || 16 / 9) } },
        p.src ? h('img', { src: p.src, onLoad: this.onImg }) : null,
        p.video
          ? h('video', { key: p.video, src: p.video, poster: p.src || undefined, autoPlay: true, muted: true, loop: true, playsInline: true, onLoadedMetadata: this.onVideo })
          : null,
      );
    },
  });

  // Ряд картинок/видео одной высоты
  var Row = createClass({
    getInitialState: function () {
      return { ratios: {} };
    },
    setRatio: function (i, r) {
      // функциональное обновление: картинки ряда грузятся почти одновременно
      this.setState(function (s) {
        var next = Object.assign({}, s.ratios);
        next[i] = r;
        return { ratios: next };
      });
    },
    render: function () {
      var self = this;
      var items = arr(this.props.items);
      var gap = this.props.gap === 0 || this.props.gap ? this.props.gap : 16;
      return h(
        'div',
        { className: 'case-row', style: { gap: gap + 'px' } },
        items.map(function (it, i) {
          it = it || {};
          if (!it.src && !it.video) return null;
          return h(
            'div',
            { key: i, className: 'case-row__item', style: { flex: (self.state.ratios[i] || 16 / 9) + ' 1 0' } },
            h(Media, {
              src: url(self.props.p, it.src),
              video: url(self.props.p, it.video),
              onRatio: function (r) {
                self.setRatio(i, r);
              },
            }),
          );
        }),
      );
    },
  });

  // Плитка на главной (видео — при наведении, как на сайте)
  var Tile = createClass({
    getInitialState: function () {
      return { hover: false };
    },
    render: function () {
      var self = this;
      var d = this.props.d;
      var p = this.props.p;
      var cover = url(p, d.cover);
      var video = url(p, d.coverVideo);
      return h(
        'div',
        {
          className: 'tile',
          onMouseEnter: function () { self.setState({ hover: true }); },
          onMouseLeave: function () { self.setState({ hover: false }); },
        },
        // как на сайте: нет ни обложки, ни видео — блока обложки нет, плитка из одного текста
        cover || video
          ? h(
              'div',
              { className: 'tile__cover ph', style: { aspectRatio: '468 / ' + (d.coverHeight || 400) } },
              cover ? h('img', { src: cover }) : null,
              video && this.state.hover
                ? h('video', { src: video, autoPlay: true, muted: true, loop: true, playsInline: true, onLoadedMetadata: startVideo })
                : null,
              video ? h('span', { className: 'pv-badge' }, '▶ видео при наведении — наведите курсор') : null,
            )
          : null,
        h(
          'div',
          { className: 'tile__info' },
          h('p', { className: 'tile__tag' }, d.tag || ''),
          h('p', { className: 'tile__title' }, d.title || ''),
          h('p', { className: 'tile__summary' }, d.summary || ''),
        ),
      );
    },
  });

  // ---------- Кейс ----------
  var CasePreview = createClass({
    render: function () {
      var p = this.props;
      var d = dataOf(p);
      var passport = [
        ['КЛИЕНТ', d.client],
        ['МОЯ РОЛЬ', d.role],
        ['ИНСТРУМЕНТЫ', d.tools],
      ].filter(function (f) { return f[1]; });
      var sections = arr(d.sections);

      return h(
        'div',
        { className: 'pv' },
        note('Плитка на главной', d.showOnHome === false ? 'сейчас скрыта с главной' : 'место в сетке задаёт «Порядок на главной»'),
        z(h('div', { className: 'pv-tile' }, h(Tile, { d: d, p: p }))),
        note('Страница кейса', 'адрес: /work/' + (d.slug || '…') + '/'),
        z(h(
          'div',
          { className: 'layout' },
          h(
            'aside',
            { className: 'layout__aside case-aside' },
            h('span', { className: 'case-aside__back' }, '← Все работы'),
            h('h1', { className: 'case-aside__title trim-druk-110' }, d.title || ''),
            d.lead ? h('p', { className: 'case-aside__lead' }, lines(d.lead)) : null,
            passport.length
              ? h(
                  'dl',
                  { className: 'passport' },
                  passport.map(function (f, i) {
                    return h('div', { key: i }, h('dt', null, f[0]), h('dd', null, f[1]));
                  }),
                )
              : null,
          ),
          h(
            'div',
            { className: 'layout__main case-main' },
            h(Media, { src: url(p, d.hero), video: url(p, d.heroVideo) }),
            sections.map(function (s, i) {
              s = s || {};
              return h(
                'section',
                { key: i, className: 'case-section' },
                h('p', { className: 'case-section__label' }, h('span', { className: 'case-section__num' }, pad2(i + 1)), ' ' + (s.label || '')),
                s.text
                  ? h('p', { className: 'case-section__text', style: s.width ? { maxWidth: s.width + 'px' } : undefined }, lines(s.text))
                  : null,
                arr(s.media).map(function (m, j) {
                  m = m || {};
                  if (m.type === 'row') return h(Row, { key: j, items: m.images, gap: m.gap, p: p });
                  if (m.type === 'caption') return h('p', { key: j, className: 'case-caption' }, m.text || '');
                  return h(Media, { key: j, src: url(p, m.src), video: url(p, m.video) });
                }),
              );
            }),
          ),
        )),
      );
    },
  });

  // ---------- Контакты и главная ----------
  var SitePreview = createClass({
    render: function () {
      var p = this.props;
      var d = dataOf(p);
      var home = d.home || {};
      var name = d.name || '';
      return h(
        'div',
        { className: 'pv' },
        note('Шапка — на всех страницах'),
        z(h(
          'header',
          { className: 'header' },
          h(
            'div',
            { className: 'header__left' },
            h('span', { className: 'header__name' }, name),
            h('nav', { className: 'header__nav' }, h('span', null, 'Работы'), h('span', null, 'Обо мне'), h('span', null, 'Контакты')),
          ),
          h(
            'div',
            { className: 'header__right' },
            h('span', { className: 'header__tg' }, h('img', { src: '/icons/telegram.svg', width: 24, height: 24, alt: '' }), '@' + (d.telegram || '')),
            h('span', { className: 'btn btn--outline' }, 'Резюме PDF →'),
          ),
        )),
        note('Главная — левая колонка'),
        z(h(
          'div',
          { className: 'layout', style: { paddingBottom: '48px' } },
          h(
            'div',
            { className: 'layout__aside home-aside' },
            h('p', { className: 'home-aside__eyebrow' }, home.eyebrow || ''),
            h('h1', { className: 'home-aside__title trim-druk-110' }, home.title || ''),
            h('p', { className: 'home-aside__desc' }, home.description || ''),
            h('div', { className: 'home-aside__buttons' }, h('span', { className: 'btn btn--primary' }, 'Написать мне'), h('span', { className: 'btn btn--outline' }, 'Резюме PDF')),
          ),
        )),
        note('Страница «Контакты»'),
        z(h(
          'div',
          { className: 'contacts' },
          h('h1', { className: 'contacts__title trim-roboto-100' }, 'Давайте работать ', h('br'), 'вместе'),
          h(
            'div',
            { className: 'contacts__list' },
            contactRow('ПОЧТА', d.email, 'Скопировать'),
            contactRow('TELEGRAM', '@' + (d.telegram || ''), 'Открыть ↗'),
            contactRow('РЕЗЮМЕ', d.resumeNote, 'Скачать ↓'),
          ),
        )),
        note('Подвал — на всех страницах, кроме «Контактов»', d.behance ? null : 'ссылка на Behance не заполнена'),
        z(h(
          'footer',
          { className: 'footer' },
          h(
            'div',
            { className: 'footer__top' },
            h('p', { className: 'footer__title' }, 'Давайте работать', h('br'), 'вместе'),
            h('div', { className: 'footer__contacts' }, h('span', null, d.email || ''), h('span', null, 'Telegram ↗'), h('span', null, 'Behance ↗')),
          ),
          h('div', { className: 'footer__bottom' }, h('p', null, '© ' + (d.year || '') + ' ' + name), h('span', { className: 'footer__up' }, 'Наверх ↑')),
        )),
      );
    },
  });
  function contactRow(label, value, action) {
    return h(
      'div',
      { className: 'contacts__row' },
      h('p', { className: 'contacts__label' }, label),
      h('p', { className: 'contacts__value' }, value || ''),
      h('p', { className: 'contacts__action' }, h('span', null, '['), ' ' + action + ' ', h('span', null, ']')),
    );
  }

  // ---------- Обо мне ----------
  var AboutPreview = createClass({
    render: function () {
      var p = this.props;
      var d = dataOf(p);
      var photo = url(p, d.photo);
      return h(
        'div',
        { className: 'pv' },
        note('Страница «Обо мне»'),
        z(h(
          'div',
          { className: 'layout' },
          h(
            'aside',
            { className: 'layout__aside about-aside' },
            h('div', { className: 'about-aside__photo ph' }, photo ? h('img', { src: photo }) : null),
            h('span', { className: 'btn btn--outline' }, 'Резюме PDF →'),
          ),
          h(
            'div',
            { className: 'layout__main about-main' },
            h(
              'div',
              { className: 'about-intro' },
              h('h1', { className: 'about-intro__title trim-druk-110' }, lines(d.title)),
              h('p', { className: 'about-intro__text' }, d.intro || ''),
              h('p', { className: 'about-intro__text2' }, d.introSecondary || ''),
            ),
            h(
              'div',
              { className: 'cards' },
              arr(d.cards).map(function (c, i) {
                c = c || {};
                return h('div', { key: i, className: 'card' }, h('p', { className: 'card__title' }, lines(c.title)), h('p', { className: 'card__text' }, lines(c.text)));
              }),
            ),
            h(
              'div',
              { className: 'about-block' },
              h('p', { className: 'about-label' }, d.toolsLabel || ''),
              h(
                'ul',
                { className: 'chips' },
                arr(d.tools).map(function (t, i) {
                  return h('li', { key: i, className: 'chip' }, t);
                }),
              ),
            ),
            h(
              'div',
              { className: 'about-block' },
              h('p', { className: 'about-label' }, d.clientsLabel || ''),
              h('div', { className: 'pv-logos' }, 'Лента логотипов клиентов (меняется в коде сайта)'),
            ),
            h(
              'div',
              { className: 'experience' },
              h('p', { className: 'about-label' }, d.experienceLabel || ''),
              arr(d.experience).map(function (r, i) {
                r = r || {};
                return h(
                  'div',
                  { key: i, className: 'experience__row' },
                  h('p', { className: 'experience__period' }, r.period || ''),
                  h('p', { className: 'experience__company' }, r.company || ''),
                  h('p', { className: 'experience__role' }, r.role || ''),
                );
              }),
            ),
          ),
        )),
      );
    },
  });

  CMS.registerPreviewTemplate('cases', CasePreview);
  CMS.registerPreviewTemplate('site', SitePreview);
  CMS.registerPreviewTemplate('about', AboutPreview);
})();
