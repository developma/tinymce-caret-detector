class TinyMCEConfig {
  constructor() {
    this.setup()
  }

  setup() {
    const caretDetector = new CaretDetector()
    tinymce.init({
      selector: '#mytextarea',
      setup: editor => {
        editor.on('KeyUp', e => caretDetector.showInfo(editor, e))
      }
    })
  }
}

class CaretDetector {
  showInfo(editor, e) {
    this.showPosition(this.getCurrentPosition(editor, e))
    this.showCurrentNodeLocation(editor)
  }
  showCurrentNodeLocation(editor) {
    document.getElementById('location').value = this.getCurrentNodeLocation(editor, this.getCurrentNode(editor))
  }
  showPosition(position) {
    const {startOffset, endOffset} = position
    document.getElementById('startOffset').value = startOffset
    document.getElementById('endOffset').value = endOffset
  }
  getCurrentPosition(editor, e) {
    const { startOffset, endOffset } = editor.selection.getRng()
    return { startOffset, endOffset }
  }
  getRootNode(editor) {
    return editor.getBody()
  }
  getCurrentNode(editor) {
    return editor.selection.getNode()
  }

  getCurrentNodeLocation(editor, currentNode) {
    const rootPNodes = this.getRootNode(editor).children
    let location = 0
    Array.from(rootPNodes).forEach((rootPNode, idx) => {
      if (rootPNode === this.getPNode(currentNode)) {
        location = idx
      }
    })
    return location
  }

  getPNode(node) {
    while (node.nodeName !== 'P') {
      node = getPNode(node.parentNode)
    }
    return node
  }
}

new TinyMCEConfig()