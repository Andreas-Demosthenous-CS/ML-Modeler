
class Subset {

    constructor(features) {
        this.features = features
        var id = ""
        for (var sub of features) {
            id += sub + '.'
        }
        this.id = id

        this.string_text = " features = { "
        for (var feature of this.features) {
            this.string_text += feature + ", "
        }
        this.string_text = this.features.length + this.string_text
        this.string_text = this.string_text.slice(0, -2)
        this.string_text += " }"

    }



}