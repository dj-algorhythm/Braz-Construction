app.preferences.rulerUnits = Units.PIXELS;
var dir = "//vboxsvr/BrazConstruction/newGalWindows/png/",
    folderObj = Folder(dir),
    files = folderObj.getFiles("*");

var imgFileRef, imgDocRef, imgLayerRef, imgFileName, tintedImgFileName;

var exportOptions, saveImgObj, saveTintedImgObj;

var glassPath, glassFileRef, glassDocRef, glassLayerRef, selectionCoordinates;

    glassPath = dir.replace("png/","newGlass4GalleryWindows.psd");
    glassFileRef = File(glassPath);
    glassDocRef = app.open(glassFileRef);


for (var i = 0; i < files.length; ++i){
    imgFileRef = File(files[i].absoluteURI);
    imgFileName = imgFileRef.name;    

    imgDocRef = app.open(imgFileRef);
    imgDocRef.crop(new Array(170,0,1195,768));

    imgDocRef.resizeImage(UnitValue(450,"px"),UnitValue(350,"px"));
    imgLayerRef = imgDocRef.backgroundLayer;
    imgLayerRef.copy();
    
    app.activeDocument = glassDocRef;
    glassLayerRef = glassDocRef.artLayers.getByName("glass");
    glassDocRef.paste();
    glassDocRef.activeLayer = glassDocRef.artLayers[0];
    selectionCoordinates = [[13,13], [13,334], [438,334], [438,13]];
    glassDocRef.selection.select(selectionCoordinates);
    glassDocRef.selection.contract(new UnitValue(2, "px"));
    glassDocRef.selection.invert();
    glassDocRef.selection.clear();

    exportOptions = new ExportOptionsSaveForWeb();
    exportOptions.format = SaveDocumentType.PNG;
    exportOptions.PNG8 = true;
    exportOptions.transparency = true;

    saveImgObj = new File(imgFileRef.absoluteURI);

    glassDocRef.exportDocument(saveImgObj,ExportType.SAVEFORWEB,exportOptions);
    
    glassDocRef.activeLayer.move(glassLayerRef,ElementPlacement.PLACEAFTER);    
    tintedImgFileName = imgFileName.replace('.png', 'Tint.png');
    saveTintedImgObj = new File(dir + tintedImgFileName);
    glassDocRef.exportDocument(saveTintedImgObj,ExportType.SAVEFORWEB,exportOptions);
    
    glassDocRef.activeLayer.remove();
    imgDocRef.close(SaveOptions.DONOTSAVECHANGES);

    imgFileRef = null;
    imgDocRef = null;
    imgLayerRef = null;
}

glassDocRef.close(SaveOptions.DONOTSAVECHANGES);
glassFileRef = null;
glassDocRef = null;