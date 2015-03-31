app.preferences.rulerUnits = Units.PIXELS;
var dir = "//vboxsvr/BrazConstruction/galBGBorderAdjust/400x800",
    folderObj = Folder(dir),
    files = folderObj.getFiles("*");

var fileRef, docRef, exportOptions, saveObj;

for (var i = 0; i < files.length; ++i){
	fileRef = File(files[i].absoluteURI);

    docRef = app.open(fileRef);

    docRef.crop(new Array(3,0,397,800));

    docRef.close(SaveOptions.SAVECHANGES);

    fileRef = null;
    docRef = null;

    // exportOptions = new ExportOptionsSaveForWeb();
    // exportOptions.format = SaveDocumentType.PNG;
    // exportOptions.PNG8 = true;
    // exportOptions.transparency = true;

    // saveObj = new File(fileRef.absoluteURI);

    // fileRef.saveAs(saveObj,exportOptions,false,Extension.LOWERCASE);
}