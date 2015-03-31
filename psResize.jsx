app.preferences.rulerUnits = Units.PIXELS;
var dir = "//vboxsvr/BrazConstruction/imgStore_29032015/",
    folderObj = Folder(dir),
    files = folderObj.getFiles("*"),
    fileRef, docRef, strFileName, newFileName;


for (var i = 0; i < files.length; ++i){
    fileRef = File(files[i].absoluteURI);
    strFileName = fileRef.name;

    docRef = app.open(fileRef);
    savedState = docRef.activeHistoryState;

    jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.formatOptions = FormatOptions.OPTIMIZEDBASELINE;
    jpgSaveOptions.matte = MatteType.NONE;
    jpgSaveOptions.quality = 8;

    docRef.resizeImage(UnitValue(1000,"px"),UnitValue(750,"px"));
    newFileName = strFileName.replace(".jpeg", "_1000x750.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(UnitValue(800,"px"),UnitValue(600,"px"));
    newFileName = strFileName.replace(".jpeg", "_800x600.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(UnitValue(400,"px"),UnitValue(300,"px"));
    newFileName = strFileName.replace(".jpeg", "_400x300.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    fileRef = null;
    docRef = null;
}
