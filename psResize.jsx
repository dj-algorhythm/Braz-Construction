app.preferences.rulerUnits = Units.PIXELS;
var dir = "//vboxsrv/Windows7Ultimate_shrFldr/brz_images_0/",
    folderObj = Folder(dir),
    files = folderObj.getFiles("*"),
    fileRef, docRef, strFileName, newFileName;


for (var i = 0; i < files.length; ++i){
    fileRef = File(files[i].absoluteURI);
    strFileName = fileRef.name;

    docRef = app.open(fileRef);
    savedState = docRef.activeHistoryState;

    jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    jpgSaveOptions.matte = MatteType.NONE;
    jpgSaveOptions.quality = 12;

    docRef.resizeImage(UnitValue(1000,"px"),UnitValue(750,"px"));
    newFileName = strFileName.replace(".jpg", "_1000x750.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(UnitValue(800,"px"),UnitValue(600,"px"));
    newFileName = strFileName.replace(".jpg", "_800x600.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(UnitValue(400,"px"),UnitValue(300,"px"));
    newFileName = strFileName.replace(".jpg", "_400x300.jpg");
    savePath = new File(dir + newFileName);
    docRef.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    fileRef = null;
    docRef = null;
}
