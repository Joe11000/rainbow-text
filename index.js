window.onload = function() {

  window.default_color_sequence = "red,orange,yellow,green,blue,indigo,red,orange,yellow,green,blue,indigo";

  function getColors(){
    return window.color_sequence.replace(/ /g, '');
  }

  function setURI(message, font_size=undefined, font_family=undefined, colors=window.default_color_sequence){
    if(message === ''){
      document.querySelector("[data-id='output-html']").innerHTML = '';
    }
    else{
      // only add a color string if color is not default
      let color_sequence_for_uri = '';
      if(colors != window.default_color_sequence){
        color_sequence_for_uri = `&color_sequence=${encodeURIComponent(colors)}`;
      }

      message_sequence_for_uri = `&message=${encodeURIComponent(encodeURIComponent(message))}`;
      document.querySelector("[data-id='output-html']").innerHTML = document.location.origin + document.location.pathname +
        `?font-size=${font_size}` + color_sequence_for_uri + `&font-family=${font_family.replace(/ /g, '%20')}` + message_sequence_for_uri;
    }
  }

  function getText() {
    return document.querySelector("[data-id='colorful-text'] pre").innerHTML;
  }
  function setText(message) {
    if(message === ''){
      message = 'Type Message Here';
    }
    document.querySelector("[data-id='colorful-text'] pre").innerHTML = message;
  }

   // Attach Listeners
  function addListenersForEditor(){
    // update text if user types in the textbox
    $textbox = document.querySelector("[data-id='controls'] textarea");
    $textbox.addEventListener('input', function(e){
      setText(this.value);
      setURI( this.value, getFontSize(), getFontFamily(), getColors() );
    });

    // font-size slider listener
    document.querySelector("[data-id='font-size-range']").addEventListener('input', function(e){
      setTextSize(this.value + 'px');
      setURI( getText(), this.value + 'px', getFontFamily(), getColors() );
    });

    // font-style listener
    document.querySelector("[data-id='font-family-selector']").addEventListener('input', function(e){
      setFontFamily(this.value);
      setURI( getText(), getFontSize(), this.value, getColors() );
    });
  }

  function getFontSize(){
    return document.querySelector("[data-id='font-size-range']").value + 'px';
  }
  function setTextSize(size){
    document.querySelector("[data-id='colorful-text'] pre").style.fontSize = size;
  }
  function getFontFamily(){
    return document.querySelector("[data-id='font-family-selector']").value;
  }
  function setFontFamily(style){
    if(style === '' || style === []) { return; }

    document.querySelector("[data-id='colorful-text'] pre").style.fontFamily = style;
  }

  // option 1: no parameters -> make page display text
    if(document.location.search === '') {
      // show page specific
      document.querySelector("[data-id='controls']").style.display = 'block';
      addListenersForEditor();
      document.querySelector("[data-id='colorful-text'] pre").style.fontFamily = getFontFamily();
      window.color_sequence = window.default_color_sequence;
    }

    // option 2: all parameters except no url param "edit=true"
    else
    {
      // edit page specific
      var uri = decodeURIComponent(document.location.search);

      var font_size = '';
      try{
        font_size = uri.match(/[&?]?font-size=([^&]*)/)[1];
        // set font size in editor
        document.querySelector("#font-size-range").value = font_size.match(/(\d+)px/)[1];
      }catch(e){
        font_size = getFontSize();
      }

      // get font-family from url
      var font_family = '';
      try{
        font_family = uri.match(/[&?]?font-family=([^&]*)&/)[1];

        // set font size in editor
        document.querySelector("[data-id='font-family-selector']").value = font_family;
      }catch(e){
        font_family = getFontFamily();
      }

      // get colors from url
      try{
        window.color_sequence = decodeURIComponent(uri.match(/color_sequence=([^&]*)/)[1]);
      }catch(e){
        window.color_sequence = default_color_sequence;
      }

      // get message from url
      var message = '';
      try{
        message = decodeURIComponent(decodeURIComponent(document.location.search.match(/message=(.*)/)[1]));
        document.querySelector('textarea').value = message;
      }catch(e){
        message = document.querySelector("textarea").getAttribute('placeholder');
      }

      setText( message, font_size, font_family );
      setTextSize(font_size);
      setFontFamily(font_family);

      // get colors from url
      var edit_existing = '';
      try{
        edit_existing = decodeURIComponent(document.location.search.match(/[&?]?edit=true[&]?/)[1]);
      }catch(e){
        edit_existing = false;
      }

      setURI( font_size, font_family, message, window.color_sequence );

      // option 3: all parameters and url param "edit=true" ->
      if(edit_existing) // add default edit_existing
      {
        document.querySelector("[data-id='controls']").style.display = 'block';
        addListenersForEditor();
      }
    }


  // color spinning animation
    var angle = 0;
    var $text = document.querySelector("[data-id='colorful-text'] pre");
    function changeAngle() {
      angle = (angle + 3) % 360;
      $text.style.background = 'linear-gradient(' + angle + 'deg,' + window.color_sequence + ')';
      $text.style.WebkitBackgroundClip = 'text';
      $text.style.WebkitTextFillColor = 'transparent';
    }
    window.startSpinning = function(){
      window.rainbowIntervalID = setInterval(changeAngle, 50);
    }
    window.stopSpinning = function(){
      clearInterval(window.rainbowIntervalID);
    }
    startSpinning();
};
