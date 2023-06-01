

class Dataset {

    constructor(id, name, filenames, target_classes, features, target) {
        this.id = id
        this.name = name
        this.filenames = filenames
        this.target_classes = target_classes
        this.features = features
        this.target = target

    }

}

class DatasetFile {

    constructor(file, name, type, bytes) {
        this.file = file
        this.name = name
        this.type = type
        this.bytes = bytes
        this.string_text = this.name + " | " + this.type + " | " + this.bytes
    }

}