let MC_ADDRESS = 0x24

enum enMCAiType {
    //% block="分类识别模式"
    type1 = 1,
    //% block="检测识别模式"
    type2 = 2
}


namespace AI_Vision_MC {
    //% blockId=MCSetMode 
    //% block="Switch vision module to %choicetype"
    //%  weight=101
    export function SetMode(choicetype: enMCAiType): void {
        let buf2 = pins.createBuffer(1);
        buf2[0] = choicetype
        pins.i2cWriteBuffer(MC_ADDRESS, buf2);
    }

}