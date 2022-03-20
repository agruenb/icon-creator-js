class EditorManager{
    
    editor;
    
    init(editorEnvironment, importerEnvironment){
        this.editor = new HTMLeditor(editorEnvironment);
        this.editor.newProject();
        this.itemImporter = new ItemImporter(this.editor, importerEnvironment);
    }
}