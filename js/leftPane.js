
var LeftPane = function() {
  var self = this;
  this.init = function() {
    self.addEvents();
    self.makeResizable();
  }
  this.addEvents = function() {
    $('[data-clickbox-opt]').click(self.clickFire);
    $('.clickbox-return').click(self.clickReturn);
  }
  this.clickFire = function(event) {
    window.onClickCard(event);
    var opt = $(this).data('clickbox-opt');
    console.log(opt);
    //$('#principalPanel').hide();
    var container = $('#' + opt );
    container.show();
  }
  this.clickReturn = function(event) {
    window.onClickCard(event);
    $('.clickbox').hide();
    //$('#principalPanel').show();
  }
  this.resizeMap = function (leftside) {
    leftside = (leftside === undefined)?document.getElementById('leftside'):leftside;
    var leftsidewidth = parseFloat(getComputedStyle(leftside, '').width);
    var totalwidth = parseFloat(getComputedStyle(document.body, '').width);
    console.log('leftsidewidth', leftsidewidth, totalwidth - leftsidewidth);
    var rightside = document.getElementById('rightside');
    leftside.style.minWidth = '450px';
    rightside.style.width = (totalwidth - leftsidewidth)  + "px";
  }
  this.makeResizable = function(){
    // https://codepen.io/rstrahl/pen/eJZQej
    // mejor http://jsfiddle.net/kxr96dzg/1/

    var m_pos;
    function resize(e){
        var parent = resize_el.parentNode;
        var dx = m_pos - e.x;
        m_pos = e.x;
        parent.style.width = (parseFloat(getComputedStyle(parent, '').width) - dx) + "px";
        resizeMap(parent);
    }
    var resize_el = document.getElementById("resize");
    resize_el.addEventListener("mousedown", function(e){
        m_pos = e.x;
        document.addEventListener("mousemove", resize, false);
    }, false);
    document.addEventListener("mouseup", function(){
        document.removeEventListener("mousemove", resize, false);
    }, false);

    $( window ).resize(function() {
      self.resizeMap();
    });

  }
}
$(function() {
  console.log("ready!");
  window.leftPane = new LeftPane();
  leftPane.init();
});

/*begin card effect*/
;(function () {
    let card  = document.getElementsByClassName('card')[0],
        moved = 0,
        interval;

    if (!card) return;
    window.onClickCard = function (event) {
      clearInterval(interval);
      card.style.transform = '';

      // Do not flip the card if the user is trying to
      // tap a link.
      if (event.target.nodeName === 'A') {
          return;
      }

      let cName   = card.getAttribute('data-toggle-class');
      let toggled = card.classList.contains(cName);
      card.classList[toggled ? 'remove' : 'add'](cName);
    }
    card.addEventListener('click', function (event) {
      //onClickCard(event);
    });

    interval = setInterval(function () {
        moved = moved ? 0 : 10;
        card.style.transform = 'translateY(' + moved + 'px)';
    }, 1500);
})();
/*end card effect*/
