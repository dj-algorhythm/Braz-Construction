var fileRef,docRef,savePath, filePath = "//vboxsrv/Windows7Ultimate_shrFldr/brz_images_1/";
app.preferences.typeUnits = TypeUnits.PIXELS;



for (var i = 0; i < 47; ++i){
    fileRef = File(filePath + i + ".jpg");
    docRef = app.open(fileRef);

    savedState = docRef.activeHistoryState;

    jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    jpgSaveOptions.matte = MatteType.NONE;
    jpgSaveOptions.quality = 12;

    docRef.resizeImage(1000,750,96,ResampleMethod.PRESERVEDETAILS);
    savePath = new File(filePath + i + "_1000x750.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(800,600,96,ResampleMethod.PRESERVEDETAILS);
    savePath = new File(filePath + i + "_800x600.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    docRef.resizeImage(400,300,96,ResampleMethod.PRESERVEDETAILS);
    savePath = new File(filePath + i + "_400x300.jpg");
    app.activeDocument.saveAs(savePath,jpgSaveOptions,true,Extension.LOWERCASE);
    savePath = null;
    docRef.activeHistoryState = savedState;

    app.activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    fileRef = null;
    docRef = null;
}
