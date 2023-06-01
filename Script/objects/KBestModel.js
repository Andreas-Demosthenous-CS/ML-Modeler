
class KBestModel{
    
    constructor(algorithm, k){
        this.algorithm = algorithm
        this.k = k
        this.string_text = this.algorithm + ' | k = ' + this.k;
    }

    getStringText() {
        return this.algorithm + ' | k = ' + this.k;
    }
}
