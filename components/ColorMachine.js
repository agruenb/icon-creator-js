class ColorMachine{
    type;
    index = 0;
    pastel = [
        "#E0BBE4",
        "#83BCD4",
        "#BEE8B7",
        "#957DAD",
        "#A4D1E0",
        "#F5B7B7",
        "#D291BC",
        "#B1DEE0",
        "#F6CACB",
        "#FEC8D8",
        "#D6F7D2",
        "#BEE8B7",
        "#FFDFD3"
    ]
    constructor(type){
        this.type = type;
    }
    next(){
        let index = this.index;
        this.index = (index + 1)%this.pallet().length;
        return this.pallet()[index];
    }
    pallet(){
        switch (this.type) {
            case "pastel":
                return this.pastel;
            default:
                console.warn("Unkown color pallet "+this.type);
                break;
        }
    }
}