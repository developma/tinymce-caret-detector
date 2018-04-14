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
  hasSpanTag(node) {
    if (node.nodeName === 'P') {
      let hasSpanTag = false
      node.childNodes.forEach(childNode => {
        if (childNode.nodeName === 'SPAN') {
          hasSpanTag = true
        }
      })
      return hasSpanTag
    }
    while (node.nodeName !== 'SPAN') {
      node = this.hasSpanTag(node.parentNode)
      if (node.nodeName === 'P') {
        return false
      }
    }
    return true
  }
  showPrevChar(editor) {
    const node = this.getCurrentNode(editor)
    const pNode = this.getPNode(node)
    if (this.hasSpanTag(node)) {
      let realPosition = this.calcCurrentPosition({editor: editor, node: node, pNode:pNode})
      document.getElementById('prev').value = pNode.innerText.charAt(realPosition - 1)
     } else {
      const text = pNode.innerText
      const { startOffset, endOffset } = this.getCurrentPosition(editor)
      if (startOffset === endOffset) {
        document.getElementById('prev').value = text.charAt(startOffset - 1)
      }
    }
  }
  calcCurrentPosition(obj) {
  const { editor, node, pNode } = obj
  const infoMap = new Map()
  pNode.childNodes.forEach((childNode, idx) => {
    const text = childNode.nodeName === '#text' ? childNode.nodeValue : childNode.innerText
    infoMap.set(idx, text)
  })
  let realPosition = 0
  pNode.childNodes.forEach((childNode, idx) => {
    const { startOffset, endOffset } = this.getCurrentPosition(editor)
    const currentText = tinymce.activeEditor.selection.getRng().startContainer.data
    const targetText = childNode.nodeName === '#text' ? childNode.nodeValue : childNode.innerText
    if (targetText === currentText && (startOffset === endOffset)) {
      for (let i = 0; i < idx; i++) {
        realPosition += infoMap.get(i).length
      }
      realPosition += startOffset
    }
  })
  return realPosition
}

  showPostChar(editor) {
    const node = this.getCurrentNode(editor)
    const pNode = this.getPNode(node)
    if (this.hasSpanTag(node)) {
      let realPosition = this.calcCurrentPosition({ editor: editor, node: node, pNode: pNode })
      document.getElementById('post').value = pNode.innerText.charAt(realPosition)
    } else {
      const text = this.getPNode(this.getCurrentNode(editor)).innerText
      const { startOffset, endOffset } = this.getCurrentPosition(editor)
      if (startOffset === endOffset) {
        document.getElementById('post').value = text.charAt(startOffset)
      }
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
      node = this.getPNode(node.parentNode)
    }
    return node
  }
}

new TinyMCEConfig().setup()