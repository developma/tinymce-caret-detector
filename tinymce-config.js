class TinyMCEConfig {
  setup() {
    const caretDetector = new CaretDetector()
    tinymce.init({
      selector: '#mytextarea',
      branding: false,
      plugins: 'textcolor',
      toolbar: 'fontsizeselect bold italic underline forecolor',
      setup: editor => {
        editor.on('KeyUp', e => caretDetector.showInfo(editor, e))
      }
    })
  }
}

class CaretDetector {
  showInfo(editor, e) {
    this.showPosition(editor)
    this.showCurrentNodeLocation(editor)
    this.showTextOfCurrentNode(editor)
    this.showPrevChar(editor)
    this.showPostChar(editor)
  }
  showPrevChar(editor) {
    const text = this.getPNode(this.getCurrentNode(editor)).innerText
    const {startOffset, endOffset} = this.getCurrentPosition(editor)
    if (startOffset === endOffset) {
      document.getElementById('prev').value = text.charAt(startOffset - 1)
    }
  }

  showPostChar(editor) {
    const text = this.getPNode(this.getCurrentNode(editor)).innerText
    const {startOffset, endOffset} = this.getCurrentPosition(editor)
    if (startOffset === endOffset) {
      document.getElementById('post').value = text.charAt(startOffset)
    }
  }


  showTextOfCurrentNode(editor) {
    const node = this.getPNode(this.getCurrentNode(editor))
    document.getElementById('text').value = node.innerText
  }

  showCurrentNodeLocation(editor) {
    document.getElementById('location').value = this.getCurrentNodeLocation(editor, this.getCurrentNode(editor))
  }
  showPosition(editor) {
    const {startOffset, endOffset} = this.getCurrentPosition(editor)
    document.getElementById('startOffset').value = startOffset
    document.getElementById('endOffset').value = endOffset
  }
  getCurrentPosition(editor) {
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

new TinyMCEConfig().setup()