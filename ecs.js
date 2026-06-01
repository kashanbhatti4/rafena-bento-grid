/* ==========================================================================
   ECS Mapping — guided bento funnel logic (vanilla, no framework).
   - Global state store  → vanilla equivalent of React Context / Zustand
   - Symptom click        → instantly re-renders the Recommended Protocol card
   - Counter Sweep        → animate dosage numbers smoothly
   - Semantic search      → real-time keyword/synonym filtering for emotional states
   - Entry animations     → spring "settle" via IntersectionObserver
   - Skeleton loading     → shapes render before images load
   - Funnel analytics     → dataLayer + PostHog events
   ========================================================================== */

(function () {
    'use strict';

    var grid = document.getElementById('ecs-grid');
    if (!grid) return;

    /* ---------- Analytics funnel (GA4 / GTM dataLayer + PostHog when present) ---------- */
    window.dataLayer = window.dataLayer || [];
    function track(event, props) {
        var payload = Object.assign({ event: event }, props || {});
        window.dataLayer.push(payload);
        if (window.posthog && typeof window.posthog.capture === 'function') {
            window.posthog.capture(event, props || {});
        }
    }

    /* ---------- Protocol content per symptom (Headline Engineering) ---------- */
    var PROTOCOLS = {
        sleep: {
            tag: 'מסלול שינה',
            title: 'פרוטוקול Sleep-Sync ל‑30 יום: ויסות מקצב היממה (Circadian Rhythm)',
            desc: 'מינון ערב מדורג לתמיכה ב‑ECS והחזרת מחזור השינה לסדרו, בליווי יועץ ECS אישי צמוד לאורך החודש הראשון.',
            dose: '15mg · בערב',
            advisor: 'ד״ר מיה ברק · נוירולוגיה'
        },
        anxiety: {
            tag: 'מסלול רוגע',
            title: 'פרוטוקול איזון הלחץ ל‑30 יום: הנמכת קורטיזול והרגעת מערכת העצבים',
            desc: 'מינון יומי מאוזן להפחתת תגובת ה“הילחם או ברח” (Fight or Flight), עם התאמות שבועיות מול יועץ ה‑ECS.',
            dose: '20mg · בוקר וערב',
            advisor: 'מתן שמיר · רוקח קליני'
        },
        pain: {
            tag: 'מסלול התאוששות',
            title: 'פרוטוקול שיכוך הכאב ל‑30 יום: הפחתת דלקת ושיקום רקמה',
            desc: 'ריכוז גבוה במיוחד לטיפול ממוקד בכאב כרוני ודלקת, בשילוב CBG פעיל, עם מעקב יועץ צמוד.',
            dose: '24mg · בוקר וערב',
            advisor: 'ד״ר יובל סמואל · רפואת כאב'
        },
        focus: {
            tag: 'מסלול בהירות',
            title: 'פרוטוקול בהירות מנטלית ל‑30 יום: פיזור ערפל מוחי וחידוד ריכוז',
            desc: 'מינון יום נמוך ועקבי לתמיכה בפוקוס ואנרגיה יציבה, ללא תופעות לוואי או נפילות מתח.',
            dose: '10mg · בוקר',
            advisor: 'ד״ר שרית ליפשיץ · רפואה פנימית'
        }
    };

    /* ---------- Global state store ---------- */
    var listeners = [];
    var state = { symptom: null, query: '' };
    function setState(patch) {
        state = Object.assign({}, state, patch);
        listeners.forEach(function (fn) { fn(state); });
    }
    function subscribe(fn) { listeners.push(fn); }

    /* ---------- Recommended Protocol card (re-renders on state change) ---------- */
    var protocolCard = document.getElementById('ecs-protocol');
    var elTag = document.getElementById('ecs-protocol-tag');
    var elTitle = document.getElementById('ecs-protocol-title');
    var elDesc = document.getElementById('ecs-protocol-desc');
    var elDose = document.getElementById('ecs-protocol-dose');
    var elAdvisor = document.getElementById('ecs-protocol-advisor');

    /* Dynamic number counter animation for dosage metric */
    function animateValue(obj, start, end, duration, suffix) {
        var startTimestamp = null;
        var step = function (timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            var progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // easeOutQuad easing
            var ease = progress * (2 - progress);
            var current = Math.floor(ease * (end - start) + start);
            obj.textContent = current + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    subscribe(function (s) {
        var p = s.symptom && PROTOCOLS[s.symptom];
        if (!p) return;
        elTag.textContent = p.tag;
        elTitle.textContent = p.title;
        elDesc.textContent = p.desc;
        elAdvisor.textContent = p.advisor;

        // Parse dosage number and run counter animation
        var match = p.dose.match(/^(\d+)(.*)$/);
        if (match && elDose) {
            var targetNum = parseInt(match[1], 10);
            var suffix = match[2];
            animateValue(elDose, 0, targetNum, 600, suffix);
        } else {
            elDose.textContent = p.dose;
        }

        // Reset dynamic rhythm classes first
        protocolCard.classList.remove('is-sleep', 'is-anxiety', 'is-pain', 'is-focus');
        // Add current active rhythm class
        protocolCard.classList.add('is-' + s.symptom);

        protocolCard.classList.add('is-active');
        // spring re-entry animation pulse
        protocolCard.classList.remove('is-in');
        void protocolCard.offsetWidth; // reflow to restart transition
        protocolCard.classList.add('is-in');
    });

    /* ---------- Symptom cards → update state ---------- */
    var symptomCards = Array.prototype.slice.call(grid.querySelectorAll('.ecs-symptom'));
    symptomCards.forEach(function (card) {
        card.addEventListener('click', function () {
            var symptom = card.getAttribute('data-symptom');
            symptomCards.forEach(function (c) { c.setAttribute('aria-pressed', String(c === card)); });
            setState({ symptom: symptom });
            track('ecs_symptom_click', { symptom: symptom });
            protocolCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });

    /* ---------- CTA progress triggers with loading simulation ---------- */
    grid.querySelectorAll('.ecs-cta').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var ctaType = btn.getAttribute('data-cta');
            track('ecs_cta_click', { cta: ctaType, symptom: state.symptom });
            
            // Add a subtle tactile button loading response to feel like a Progress Trigger
            var originalText = btn.innerHTML;
            btn.innerHTML = window.currentLoaderText || 'היועץ שלך מרכיב לך את הקוקטייל הבוטני המדויק... 🧠✨';
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.85';
            
            setTimeout(function () {
                btn.innerHTML = originalText;
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
                
                // If it is dosage or adviser, standardise response redirect
                if (ctaType === 'dosage') {
                    alert('פרוטוקול המינון האישי שלך מחושב במערכת! יועץ ECS ייצור עמך קשר עם המלצות מדויקות.');
                } else if (ctaType === 'map90' || ctaType === 'analyze') {
                    window.open('https://wa.me/972524588218', '_blank');
                }
            }, 1000);
        });
    });

    /* ---------- Semantic search: synonym → symptom/keyword matching ---------- */
    var SYNONYMS = {
        sleep: [
            'שינה', 'ישן', 'נדודי', 'עייף', 'תשוש', 'מתעורר', 'אינסומניה', 'סהרורי', 'חוסר שינה', 'סחוט', 'מותש',
            'sleep', 'insomnia', 'tired', 'exhausted', 'sleepless', 'awake', 'night', 'fatigue'
        ],
        anxiety: [
            'חרדה', 'לחץ', 'מוצף', 'רועד', 'דאגה', 'פאניקה', 'סטרס', 'עצבנות', 'אי שקט', 'מתוח', 'מבוהל',
            'anxious', 'overwhelmed', 'shaky', 'stressed', 'panic', 'worry', 'nervous', 'tension'
        ],
        pain: [
            'כאב', 'דלקת', 'שרירים', 'פרקים', 'גב', 'כאבים', 'דקורטיבי', 'סובל', 'כואב', 'דואב',
            'pain', 'ache', 'inflammation', 'sore', 'chronic', 'joints', 'back'
        ],
        focus: [
            'ערפל', 'פוקוס', 'ריכוז', 'בהירות', 'ערפל מוחי', 'חלש', 'מפוזר', 'חדות', 'שוכח', 'עמום',
            'foggy', 'focus', 'clarity', 'concentration', 'brain fog', 'cognition', 'attention'
        ]
    };
    var searchInput = document.getElementById('ecs-search-input');
    var clearBtn = document.getElementById('ecs-search-clear');
    var noResults = document.getElementById('ecs-no-results');
    var allCards = Array.prototype.slice.call(grid.querySelectorAll('.ecs-card'));

    function expandQuery(q) {
        // Map emotional keywords to symptom groups so related cards surface
        var terms = [q];
        Object.keys(SYNONYMS).forEach(function (sym) {
            if (SYNONYMS[sym].some(function (w) { return q.indexOf(w) !== -1 || w.indexOf(q) !== -1; })) {
                terms = terms.concat(SYNONYMS[sym]).concat([sym]);
            }
        });
        return terms;
    }

    function runSearch(raw) {
        var q = (raw || '').trim().toLowerCase();
        clearBtn.hidden = q.length === 0;
        if (!q) {
            allCards.forEach(function (c) { c.classList.remove('is-filtered-out'); });
            noResults.hidden = true;
            return;
        }
        var terms = expandQuery(q);
        var anyVisible = false;
        allCards.forEach(function (card) {
            var hay = ((card.getAttribute('data-keywords') || '') + ' ' + card.textContent).toLowerCase();
            var match = terms.some(function (t) { return t && hay.indexOf(t) !== -1; });
            card.classList.toggle('is-filtered-out', !match);
            if (match) anyVisible = true;
        });
        // Recommended protocol + compliance anchors always stay visible for guidance
        protocolCard.classList.remove('is-filtered-out');
        noResults.hidden = anyVisible;
    }

    if (searchInput) {
        var t;
        searchInput.addEventListener('input', function () {
            clearTimeout(t);
            t = setTimeout(function () {
                setState({ query: searchInput.value });
                runSearch(searchInput.value);
                if (searchInput.value.trim()) track('ecs_semantic_search', { query: searchInput.value.trim() });
            }, 120);
        });
        clearBtn.addEventListener('click', function () {
            searchInput.value = '';
            runSearch('');
            searchInput.focus();
        });
    }

    /* ---------- Skeleton loading: hide shimmer once image is ready ---------- */
    grid.querySelectorAll('.ecs-advisor-media').forEach(function (media) {
        var img = media.querySelector('img');
        if (!img) return;
        function done() { media.classList.add('is-loaded'); }
        if (img.complete && img.naturalWidth > 0) done();
        else { img.addEventListener('load', done); img.addEventListener('error', done); }
    });

    /* ---------- Spring "settle" entry animations (IntersectionObserver) ---------- */
    var animTargets = Array.prototype.slice.call(grid.parentNode.querySelectorAll('.bento-anim'));
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var order = parseInt(el.getAttribute('data-anim-order') || '0', 10);
                el.style.transitionDelay = (order * 65) + 'ms';
                el.classList.add('is-in');
                obs.unobserve(el);
            });
        }, { threshold: 0.12 });
        animTargets.forEach(function (el) { io.observe(el); });
    } else {
        animTargets.forEach(function (el) { el.classList.add('is-in'); });
    }

    /* ---------- Funnel entrance event (fires once when section is seen) ---------- */
    var section = document.getElementById('ecs-mapping');
    if (section && 'IntersectionObserver' in window) {
        var entered = false;
        var io2 = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting && !entered) {
                    entered = true;
                    track('ecs_bento_entrance', {});
                    io2.disconnect();
                }
            });
        }, { threshold: 0.25 });
        io2.observe(section);
    }
})();
