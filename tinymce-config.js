class TinyMCEConfig {
  setup() {
    const caretDetector = new CaretDetector()
    tinymce.init({
      selector: '#mytextarea',
      menubar: false,
      branding: false,
      plugins: 'textcolor',
      toolbar: 'fontsizeselect bold italic underline forecolor',
      setup: editor => {
        editor.on('KeyUp', () => caretDetector.showInfo(editor))
        editor.on('change', () => console.log('change'))
      },
      content_css: './index.css'
    })
    return this
  }
  attach() {
    const $ = tinymce.dom.DomQuery
    $('#tinymce').on({ input: e => console.log('input!' + e) })
  }
}

class CaretDetector {
  showInfo(editor) {
    this.showPosition(editor)
    this.showCurrentNodeLocation(editor)
    this.showTextOfCurrentNode(editor)
    this.showPrevChar(editor)
    this.showPostChar(editor)
  }

  hasDecorationTag(node) {
    const decorationTagList = ['SPAN', 'STRONG', 'EM']
    if (node.nodeName === 'P') {
      let hasDecorationTag = false
      node.childNodes.forEach(childNode => {
        const nodeName = childNode.nodeName
        if (decorationTagList.indexOf(nodeName) !== -1) {
          hasDecorationTag = true
        }
      })
      return hasDecorationTag
    }
    while (decorationTagList.indexOf(node.nodeName) !== -1) {
      node = this.hasDecorationTag(node.parentNode)
      if (node.nodeName === 'P') {
        return false
      }
    }
    return true
  }

  getPrevChar(editor) {
    const node = this.getCurrentNode(editor)
    const pNode = this.getPNode(node)
    let prevChar = null
    if (this.hasDecorationTag(node)) {
      let realPosition = this.calcCurrentPosition({
        editor: editor,
        node: node,
        pNode: pNode
      })
      prevChar = pNode.innerText.charAt(realPosition - 1)
    } else {
      const text = pNode.innerText
      const { startOffset, endOffset } = this.getCurrentPosition(editor)
      if (startOffset === endOffset) {
        prevChar = text.charAt(startOffset - 1)
      }
    }
    return prevChar
  }

  showPrevChar(editor) {
    document.getElementById('prev').value = this.getPrevChar(editor)
  }

  calcCurrentPosition(obj) {
    const { editor, node, pNode } = obj
    const infoMap = new Map()
    let realPosition = 0
    pNode.childNodes.forEach((childNode, idx) => {
      const text =
        childNode.nodeName === '#text'
          ? childNode.nodeValue
          : childNode.innerText
      infoMap.set(idx, text)
      const { startOffset, endOffset } = this.getCurrentPosition(editor)
      const currentText = tinymce.activeEditor.selection.getRng().startContainer
        .data
      const targetText =
        childNode.nodeName === '#text'
          ? childNode.nodeValue
          : childNode.innerText
      if (targetText === currentText && startOffset === endOffset) {
        for (let i = 0; i < idx; i++) {
          realPosition += infoMap.get(i).length
        }
        realPosition += startOffset
      }
    })
    return realPosition
  }
  getPostChar(editor) {
    let postChar = null
    const node = this.getCurrentNode(editor)
    const pNode = this.getPNode(node)
    if (this.hasDecorationTag(node)) {
      let realPosition = this.calcCurrentPosition({
        editor: editor,
        node: node,
        pNode: pNode
      })
      postChar = pNode.innerText.charAt(realPosition)
    } else {
      const text = this.getPNode(this.getCurrentNode(editor)).innerText
      const { startOffset, endOffset } = this.getCurrentPosition(editor)
      if (startOffset === endOffset) {
        postChar = text.charAt(startOffset)
      }
    }
    return postChar
  }

  showPostChar(editor) {
    document.getElementById('post').value = this.getPostChar(editor)
  }

  showTextOfCurrentNode(editor) {
    const node = this.getPNode(this.getCurrentNode(editor))
    document.getElementById('text').value = node.innerText
  }

  showCurrentNodeLocation(editor) {
    document.getElementById('location').value = this.getCurrentNodeLocation(
      editor,
      this.getCurrentNode(editor)
    )
  }

  showPosition(editor) {
    const { startOffset, endOffset } = this.getCurrentPosition(editor)
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

new TinyMCEConfig().setup().attach()
