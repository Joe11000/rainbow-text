// this is not pretty javascript...
(function() {

  const color_hash = {
    'red': '#FF0000',
    'orange': '#FFA500',
    'yellow': '#FFFF00',
    'green': '#00FF00',
    'blue': '#0000FF',
    'indigo': '#4B0082'
  };

  window.default_color_sequence = "#FF0000,#FFA500,#FFFF00,#00FF00,#0000FF,#4B0082,#FF0000,#FFA500,#FFFF00,#00FF00,#0000FF,#4B0082";

  function updateColorSelectors(){
    result = $("[data-class='color-selector'] input").toArray().map(function(color_input){
      return color_input.value
    }).join(',')

    stopSpinning();
    window.color_sequence = result;
    startSpinning();

    setURI( { 'colors': color_sequence } );
  }

  function createColorSelectors(colors_str) {
    var result = '';

    colors_str.split(',').forEach( (color) => {
      color_hex = color_hash[color] || color;

      result += `<li class='ui-state-default color-selector' data-class='color-selector' draggable='true'>
        <input type='color' class='input-color' data-class='input-color' value='${color_hex}'/>
        <a href='#' class='delete-color-link' data-class='delete-color-link'>
          <img src="delete.png">
        </a>
      </li>
      `;
    });

    return result;
  }

  function createColorButton() {
    return `<button class='add-color-button' data-id='add-color-button'/>&#10133;</button>`;
  }

  function getColors() {
    return window.color_sequence.replace(/ /g, '');
  }

  function isTextShadowChecked() {
    return $("[data-id='text-shadow-checkbox']:checked").length == 1
  }

  function getTextShadow() {
    return $("[data-id='text-shadow-range']").val();
  }

  function setTextShadow(val) {
    stopSpinning();
    $("[data-id='colorful-text'] pre").css('text-shadow', `0 0 ${val}px`)
    startSpinning();
  }

  function removeTextShadow(val) {
    stopSpinning();
    $("[data-id='colorful-text'] pre").css('text-shadow', '')
    startSpinning();
  }

  function setURI(args=({})) {

    let message = args['message'] || getText();
    let font_size = args['font-size'] || getFontSize();
    let font_family = args['font-family'] || getFontFamily();
    let colors = args['colors'] || getColors();
    let text_shadow = args['text-shadow'] || getTextShadow();

    if(button_text_changed) {
      document.querySelector('#controls #output-html-wrapper button').innerHTML = " Copy URL: ";
    }

    // only add a color string if color is not default
    let color_sequence_for_uri = '';
    if(colors != window.default_color_sequence){
      color_sequence_for_uri = `&color-sequence=${encodeURIComponent(colors)}`;
    }

    let text_shadow_sequence_for_uri = isTextShadowChecked() ? `&text-shadow=${getTextShadow()}` : '';
    let message_sequence_for_uri = `&message=${encodeURIComponent(encodeURIComponent(message))}`;

    let output = document.location.origin + document.location.pathname +
      `?font-size=${font_size}` + color_sequence_for_uri +
      `&font-family=${font_family.replace(/ /g, '%20')}` +
      text_shadow_sequence_for_uri +
      message_sequence_for_uri;

    document.querySelector("[data-id='output-html']").innerHTML = output;
    debugger
    if(output.length > 2000 ){
      $("[data-id='output-html']").css('color', 'red')
      $("[data-id='output-html']").prop('title', `URL IS ${output.length - 2000} characters too long. Internet URLs are not guarenteed to work if they exceed 2000 characters. Proceed at your own risk.`)
    }
    else if(output.length >= 1800 ) {
      $("[data-id='output-html']").css('color', 'orange')
      $("[data-id='output-html']").prop('title', `Only ${2000 - output.length} more characters allowed in the url.`)
    }
    else {
      $("[data-id='output-html']").css('color', 'white')
      $("[data-id='output-html']").prop('title', `At ${output.length} characters. Only 2000 allowed safely in urls.`)

    }
  }

  function getText() {
    return document.querySelector("[data-id='colorful-text'] pre").innerHTML;
  }
  function setText(message) {
    if(message === '' || message === undefined){
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
      setURI( { 'message': this.value } );
    });

    // font-size slider listener
    document.querySelector("[data-id='font-size-range']").addEventListener('input', function(e){
      setTextSize(this.value + 'px');
      setURI( {'font-size': this.value + 'px' } );
    });

    // font-style listener
    document.querySelector("[data-id='font-family-selector']").addEventListener('input', function(e){
      setFontFamily(this.value);
      setURI( {'font-style': this.value });
    });

    $("[data-id='text-shadow-checkbox']").on('change', function() {
      if(this.checked){
        let val = $(this).siblings("[data-id='text-shadow-range']").val()
        setTextShadow(val);
      }
      else {
        removeTextShadow();
      }

      setURI( {'text-shadow': undefined } );
    });

    $("[data-id='text-shadow-range']").on('input', function() {
      if( !isTextShadowChecked()) {
        $("[data-id='text-shadow-checkbox']").prop( 'checked', true );
      }
      setTextShadow(this.value);
      setURI( {'text-shadow': this.value} );
    });
  };

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

  // color spinning animation
    var angle = 0;
    var $text = document.querySelector("[data-id='colorful-text'] pre");
    function changeAngle() {
      angle = (angle + 3) % 360;
      $text.style.background = 'linear-gradient(' + angle + 'deg,' + window.color_sequence + ')';
      $text.style.WebkitBackgroundClip = 'text';
      $text.style.WebkitTextFillColor = 'transparent';
    }

    window.is_spinning = false;
    window.startSpinning = function(){
      if(!window.is_spinning) {
        window.rainbowIntervalID = setInterval(changeAngle, 50);
        window.is_spinning = true;
      }
    }
    window.stopSpinning = function(){
      if(window.is_spinning) {
        clearInterval(window.rainbowIntervalID);
        window.is_spinning = false;
      }
    }

      // option 1: no parameters -> make page display text
    if(document.location.search === '') {
      // show page specific
      document.querySelector("[data-id='controls']").style.display = 'block';
      addListenersForEditor();
      document.querySelector("[data-id='colorful-text'] pre").style.fontFamily = getFontFamily();
      window.color_sequence = window.default_color_sequence;
    }

  // change settings inside controller
  // option 2: all parameters except no url param "edit=true"

    // option 3: at the end of option 2
    else
    {
      // edit page specific
      var uri = decodeURIComponent(document.location.search);

      // get colors from url
      var edit_existing;
      try{
        edit_existing = decodeURIComponent(document.location.search.match(/[&?]?edit=true[&]?/)[1]);
      }catch(e){
        edit_existing = false;
      }

      var font_size;
      try{
        font_size = uri.match(/[&?]?font-size=([^&]*)/)[1];
      }catch(e){
        font_size = getFontSize();
      }

      // get font-family from url
      var font_family;
      try{
        font_family = uri.match(/[&?]?font-family=([^&]*)&/)[1];
      }catch(e){
        font_family = getFontFamily();
      }

      // get colors from url
      try{
        window.color_sequence = decodeURIComponent(uri.match(/color-sequence=([^&]*)/)[1]);
      }catch(e){
        window.color_sequence = default_color_sequence;
      }

      // get text-shadow from url
      var text_shadow;
      try{
        text_shadow = uri.match(/[&?]?text-shadow=([^&]*)&/)[1];
      }catch(e){}

      // get message from url
      var message = '';
      try{
        message = decodeURIComponent(decodeURIComponent(document.location.search.match(/message=(.*)/)[1]));
      }catch(e){
        message = document.querySelector("textarea").getAttribute('placeholder');
      }

      setText( message, font_size, font_family );
      setTextSize(font_size);
      setFontFamily(font_family);

      if(text_shadow != undefined) {
        setTextShadow(Number.parseInt(text_shadow));
      }


  // option 3: all parameters and url param "edit=true" ->
      if(edit_existing) // add default edit_existing
      {
        if(text_shadow != undefined) {
          $("[data-id='text-shadow-checkbox']").prop( 'checked', true);
          $("[data-id='text-shadow-range']").val(Number.parseInt(text_shadow));
        }
        // set font size in editor
        document.querySelector("#font-size-range").value = font_size.match(/(\d+)px/)[1];

        // set font family in editor
        document.querySelector("[data-id='font-family-selector']").value = font_family;

        if(message != '' && message != undefined && message != 'Type Message Here'){
          document.querySelector('textarea').value = message;
        }

        document.querySelector("[data-id='controls']").style.display = 'block';

        setURI( { 'message': message, 'text-shadow': text_shadow, 'font-size': font_size, 'font-family': font_family, 'colors': window.color_sequence } );
        addListenersForEditor();
      }
    }

    startSpinning();

    document.querySelector("[data-id='color-selector-wrapper'] ul").innerHTML = createColorSelectors(getColors()) + createColorButton();

    // add color
    $("[data-id='add-color-button']").on('click', function(e) {
      $("[data-id='add-color-button']").before(createColorSelectors('#000000'));
      updateColorSelectors();
      setURI();
    });

    // change color
    $("[data-id='color-selector-wrapper']").on('change', "[data-class='delete-color-link']", function(e) {
      updateColorSelectors();
    });

    // delete color
    $("[data-id='color-selector-wrapper']").on('click', "[data-class='delete-color-link']", function(e) {
      e.preventDefault();

      $(this).parent("[data-class='color-selector']").remove();
      updateColorSelectors();
    });

    $( '.ui-sortable' ).sortable();
    $( '.ui-sortable' ).disableSelection();

    // when dropping a dragged color, update the url and the color of text
    $( '.ui-sortable' ).sortable({
        stop: function( ) {
            updateColorSelectors();
            setURI();
        }
    });

    $("[data-id='color-selector-wrapper']").on('change', "[data-class='input-color']", function(){
      setURI();
      updateColorSelectors();
    });

    // Clipboard
    var clipboard = new Clipboard('#controls #output-html-wrapper button');
    var button_text_changed = false;

    clipboard.on('success', function(e) {
      document.querySelector('#controls #output-html-wrapper button').innerHTML = 'Copied!!!'
      button_text_changed = true;
      e.clearSelection();
    });

    clipboard.on('error', function(e) {
      button_text_changed = false
      console.error('Action:', e.action);
      console.error('Trigger:', e.trigger);
    });
})();

