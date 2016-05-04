function setupAnimations() {
  $("#turnbull").animateSprite({
          fps: 6,
          loop:true,
          animations: {
            winning: [2,3,2,3,2,3],
            blink1:[0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
            blink2:[0,0,0,0,1,0,0,0,1,0,0,0,0,0,0],
            blink3:[0,0,1,0,0,0,0,0,0,0,1,0,0,0,0],
          },
          autoplay:false
        });

  $("#shorten").animateSprite({
          fps: 6,
          loop:true,
          animations: {
            winning: [2,3,2,3,2,3],
            blink1:[0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
            blink2:[0,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
            blink3:[0,0,0,0,0,1,0,0,0,0,0,0,0,1,0],
          },
          autoplay:false
        });

}

function turnbullBlink() {
      $("#turnbull").animateSprite('play', 'blink1');
      turnbullBlinkTimer = window.setInterval(function() {
        var randTime = Math.floor((Math.random() * 3) + 1);
        var blink = 'blink' + String(randTime)
        $("#turnbull").animateSprite('play', blink);
      }, 3000);
}

function shortenBlink() {
      $("#shorten").animateSprite('play', 'blink1');
      shortenBlinkTimer = window.setInterval(function() {
        var randTime = Math.floor((Math.random() * 3) + 1);
        var blink = 'blink' + String(randTime)
        $("#shorten").animateSprite('play', blink);
      }, 3000);
}