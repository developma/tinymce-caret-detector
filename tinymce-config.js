class TinyMCEConfig {
  constructor() {
    this.setup()
  }

  setup() {
    const caretDetector = new CaretDetector()
    tinymce.init({
      selector: '#mytextarea',
      setup: editor => {
        editor.on('KeyUp', e => caretDetector.getCurrentPosition(editor, e))
      }
    })
  }
}

class CaretDetector {
  getCurrentPosition(editor, e) {
    const { startOffset, endOffset } = editor.selection.getRng()
    const startElem = document.getElementById('startOffset')
    startElem.value = startOffset
    const endElem = document.getElementById('endOffset')
    endElem.value = endOffset
  }
}

new TinyMCEConfig()