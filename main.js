const editor = document.getElementById('editor');
const lineNumbers = document.getElementById('lineNumbers');
const statusBar = document.getElementById('statusBar');
const fileMenu = document.getElementById('fileMenu');
const fileDropdown = document.getElementById('fileDropdown');
let currentFilePath = null;

// 初始化
updateLineNumbers();
updateCursorPosition();
fileMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    fileDropdown.style.display = fileDropdown.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', () => {
    fileDropdown.style.display = 'none';
});

fileDropdown.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (!action) return;

    switch (action) {
        case 'new':
            if (confirm('是否创建新文档？未保存的内容将会丢失。')) {
                editor.value = '';
                currentFilePath = null;
                updateLineNumbers();
                updateCursorPosition();
                document.querySelector('.window-title').textContent = '记事本';
            }
            break;

        case 'open':
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.txt,text/*';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    editor.value = event.target.result;
                    currentFilePath = file.name;
                    document.querySelector('.window-title').textContent = `${file.name} - 记事本`;
                    updateLineNumbers();
                    updateCursorPosition();
                };
                reader.readAsText(file);
            };
            fileInput.click();
            break;

        case 'save':
            if (currentFilePath) {
                triggerDownload(editor.value, currentFilePath);
            } else {
                const fileName = prompt('保存文件', '无标题.txt');
                if (fileName) {
                    if (!fileName.endsWith('.txt')) fileName += '.txt';
                    triggerDownload(editor.value, fileName);
                    currentFilePath = fileName;
                    document.querySelector('.window-title').textContent = `${fileName} - 记事本`;
                }
            }
            break;

        case 'saveAs':
            let saveName = prompt('另存为', currentFilePath || '无标题.txt');
            if (saveName) {
                if (!saveName.endsWith('.txt')) saveName += '.txt';
                triggerDownload(editor.value, saveName);
                currentFilePath = saveName;
                document.querySelector('.window-title').textContent = `${saveName} - 记事本`;
            }
            break;

        case 'exit':
            if (confirm('确定要退出吗？')) {
                document.querySelector('.notepad-window').style.display = 'none';
            }
            break;
    }
    fileDropdown.style.display = 'none';
});

function triggerDownload(text, filename) {
    try {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        }, 100);
    } catch (err) {
        alert('保存失败：' + err.message);
    }
}

editor.addEventListener('input', () => {
    updateLineNumbers();
    updateCursorPosition();
});

editor.addEventListener('keyup', updateCursorPosition);
editor.addEventListener('click', updateCursorPosition);

editor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = editor.scrollTop;
});

function updateLineNumbers() {
    const lines = editor.value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= lines; i++) {
        numbers += i + '\n';
    }
    lineNumbers.textContent = numbers;
}

function updateCursorPosition() {
    const pos = editor.selectionStart;
    const text = editor.value.substring(0, pos);
    const lines = text.split('\n');
    const row = lines.length;
    const col = lines[row - 1].length + 1;
    statusBar.textContent = `第 ${row} 行，第 ${col} 列 100% Windows (CRLF) UTF-8`;
}

document.querySelector('.close-btn').addEventListener('click', () => {
    window.close();
});
