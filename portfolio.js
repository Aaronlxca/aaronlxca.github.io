(function(){
  "use strict";
  var doc=document.documentElement,main=document.getElementById('main');
  var chapters=Array.from(main.querySelectorAll(':scope > .chapter'));
  var navLinks=Array.from(document.querySelectorAll('.wide-nav a[href^="#"],.small-nav a[href^="#"],.chapter-rail a[href^="#"]'));
  var menu=document.querySelector('.small-nav'),toggle=menu.querySelector('summary');
  var year=document.getElementById('year');if(year)year.textContent=new Date().getFullYear();
  var headings=chapters.map(function(c){var h=c.querySelector('h1,h2');if(h)h.tabIndex=-1;return h;});
  function focusChapter(i){if(headings[i])headings[i].focus({preventScroll:true});}
  function closeMenu(){menu.open=false;}
  menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});
  var largeScreen=window.matchMedia('(min-width:821px) and (min-height:560px) and (pointer:fine)');
  var mobileProgress=document.getElementById('mobile-progress');
  var reduceMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
  var active=0,deck=false,lockUntil=0,accum=0,resizeQueued=false;
  var chapterDuration=680;
  function indexForHash(){
    return chapters.findIndex(function(p){return '#'+p.id===window.location.hash;});
  }
  function nearestVisible(){
    var nearest=0,dist=Infinity;
    chapters.forEach(function(p,i){var d=Math.abs(p.getBoundingClientRect().top);if(d<dist){nearest=i;dist=d;}});
    return nearest;
  }
  function markActive(i){
    var previous=active;
    active=Math.max(0,Math.min(i,chapters.length-1));
    chapters.forEach(function(c,j){
      c.classList.toggle('is-active',j===active);
      c.inert=deck&&j!==active;
    });
    navLinks.forEach(function(a){
      if(a.getAttribute('href')==='#'+chapters[active].id)a.setAttribute('aria-current','location');
      else a.removeAttribute('aria-current');
    });
    document.body.dataset.ground=chapters[active].classList.contains('light-ground')?'light':'dark';
    if(mobileProgress)mobileProgress.style.transform='scaleX('+((active+1)/chapters.length)+')';
    if(active!==previous)document.dispatchEvent(new Event('portfolio:chapter-change'));
  }
  function positionDeck(){
    main.style.transform='translate3d(0,-'+(active*100)+'svh,0)';
  }
  function configure(){
    var next=largeScreen.matches&&!reduceMotion.matches;
    if(next===deck){if(!deck)syncMobilePosition();return;}
    if(next){
      var requested=indexForHash();
      var fromScroll=requested>=0?requested:nearestVisible();
      deck=true;
      doc.classList.add('cascade-enabled');
      markActive(fromScroll);
      positionDeck();
      requestAnimationFrame(function(){if(deck)doc.classList.add('cascade-ready');});
    }else{
      var wasDeck=deck,prior=active;
      deck=false;
      doc.classList.remove('cascade-enabled','cascade-ready','cascade-jump');
      main.style.removeProperty('transform');
      markActive(prior);
      if(wasDeck)requestAnimationFrame(function(){chapters[prior].scrollIntoView({behavior:'instant',block:'start'});});
    }
    accum=0;
  }
  function go(i,hashMode,direction,moveFocus){
    if(i<0||i>=chapters.length)return;
    if(!deck)return;
    var old=active;
    var carryFocus=i!==old&&chapters[old].contains(document.activeElement);
    var jump=Math.abs(i-old)>1;
    var wasJump=doc.classList.contains('cascade-jump');
    doc.classList.toggle('cascade-jump',jump);
    if(wasJump&&!jump)main.getBoundingClientRect();
    markActive(i);
    if(i!==old||direction===0){
      if(direction<0)chapters[i].scrollTop=Math.max(0,chapters[i].scrollHeight-chapters[i].clientHeight);
      else chapters[i].scrollTop=0;
    }
    positionDeck();
    lockUntil=performance.now()+(jump?160:chapterDuration);
    accum=0;
    var hash='#'+chapters[i].id;
    if(hashMode==='push'&&location.hash!==hash)history.pushState(null,'',hash);
    else if(hashMode==='replace')history.replaceState(null,'',hash);
    if(moveFocus||carryFocus)focusChapter(i);
  }
  function innerScroll(delta){
    var c=chapters[active],max=Math.max(0,c.scrollHeight-c.clientHeight);
    if(delta>0&&c.scrollTop<max-3){c.scrollTop=Math.min(max,c.scrollTop+delta);return true;}
    if(delta<0&&c.scrollTop>3){c.scrollTop=Math.max(0,c.scrollTop+delta);return true;}
    return false;
  }
  window.addEventListener('wheel',function(e){
    if(!deck||e.ctrlKey||e.metaKey||e.shiftKey||e.defaultPrevented)return;
    if(e.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    var amount=e.deltaY*(e.deltaMode===1?18:e.deltaMode===2?window.innerHeight:1);
    if(Math.abs(amount)<1)return;
    e.preventDefault();
    if(performance.now()<lockUntil)return;
    if(innerScroll(amount)){accum=0;return;}
    if((accum>0)!==(amount>0))accum=0;
    accum+=amount;
    if(Math.abs(accum)>=60)go(active+(amount>0?1:-1),'replace',amount>0?1:-1);
  },{passive:false});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){var wasOpen=menu.open;closeMenu();if(wasOpen)toggle.focus({preventScroll:true});return;}
    if(!deck||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
    var target=e.target;
    if(target.closest('input,textarea,select,button,a,summary,[contenteditable="true"]'))return;
    var dir=(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' ')?1:(e.key==='ArrowUp'||e.key==='PageUp')?-1:0;
    if(!dir)return;
    e.preventDefault();
    if(performance.now()<lockUntil)return;
    if(!innerScroll(dir*300))go(active+dir,'replace',dir,true);
  });
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var index=chapters.findIndex(function(c){return '#'+c.id===a.getAttribute('href');});
      if(index<0||e.button!==0||e.ctrlKey||e.metaKey||e.altKey||e.shiftKey)return;
      if(a.classList.contains('skip')){
        e.preventDefault();
        if(deck)go(0,'push',0,true);
        else{
          chapters[0].scrollIntoView({behavior:'instant',block:'start'});
          if(location.hash!=='#home')history.pushState(null,'','#home');
          focusChapter(0);
        }
        return;
      }
      e.preventDefault();
      if(deck)go(index,'push',0,true);
      else{
        chapters[index].scrollIntoView({behavior:reduceMotion.matches?'instant':'smooth',block:'start'});
        if(window.location.hash!=='#'+chapters[index].id)history.pushState(null,'','#'+chapters[index].id);
        focusChapter(index);
      }
    });
  });
  window.addEventListener('popstate',function(){
    var i=indexForHash();
    if(i<0&&!window.location.hash)i=0;
    if(i>=0){
      if(deck)go(i,'none',0);
      else chapters[i].scrollIntoView({behavior:'instant',block:'start'});
      // Let browser history restore its state before restoring destination focus.
      requestAnimationFrame(function(){focusChapter(i);});
    }
  });
  function refresh(){
    if(resizeQueued)return;
    resizeQueued=true;
    requestAnimationFrame(function(){resizeQueued=false;configure();if(deck)positionDeck();});
  }
  window.addEventListener('resize',refresh,{passive:true});
  if(largeScreen.addEventListener)largeScreen.addEventListener('change',refresh);
  if(reduceMotion.addEventListener)reduceMotion.addEventListener('change',refresh);
  var mobileScrollFrame=false;
  function syncMobilePosition(){
    if(deck)return;
    var focus=window.innerHeight*.4,idx=-1;
    chapters.some(function(chapter,i){
      var rect=chapter.getBoundingClientRect();
      if(rect.top<=focus&&rect.bottom>focus){idx=i;return true;}
      return false;
    });
    markActive(idx>=0?idx:nearestVisible());
  }
  window.addEventListener('scroll',function(){
    if(deck||mobileScrollFrame)return;
    mobileScrollFrame=true;
    requestAnimationFrame(function(){mobileScrollFrame=false;syncMobilePosition();});
  },{passive:true});
  var initial=indexForHash();
  if(initial>=0)active=initial;
  configure();
  if(!deck)syncMobilePosition();
  if(deck&&initial>=0)go(initial,'none',0);
})();
