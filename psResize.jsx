var fileRef,docRef,savedState,savePath, filePath = "//vboxsrv/BrazConstruction/braz/img/g_venetian";


for (var i = 3; i < 6; ++i){
    fileRef = File(filePath + i + ".jpg");
    docRef = app.open(fileRef);

    savedState = docRef.activeHistoryState;

    jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    jpgSaveOptions.matte = MatteType.NONE;
    jpgSaveOptions.quality = 12;

    docRef.resizeImage(1000,750);
    savePath = new File(filePath + i + "_1000x750.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(800,600);
    savePath = new File(filePath + i + "_800x600.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(400,300);
    savePath = new File(filePath + i + "_400x300.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(250,188);
    savePath = new File(filePath + i + "_250x188.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    fileRef = null;
    docRef = null;
}
