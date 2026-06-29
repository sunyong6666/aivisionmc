let MC_ADDRESS = 0x24

// 基地址
const CLASS_BASE = 15

// 分类地址
const CLASS_CTRL = CLASS_BASE + 0x00      
const CLASS_LEN = CLASS_BASE + 0x01       
const CLASS_PATH = CLASS_BASE + 0x02     
const CLASS_ID = CLASS_BASE + 0x03        
const CLASS_SCORE = CLASS_BASE + 0x04    

function writeReg(reg: number, value: number): void {
    let buf = pins.createBuffer(2)
    buf[0] = reg
    buf[1] = value
    pins.i2cWriteBuffer(MC_ADDRESS, buf)
}

function readReg(reg: number): number {
    pins.i2cWriteNumber(MC_ADDRESS, reg, NumberFormat.UInt8BE)
    return pins.i2cReadNumber(MC_ADDRESS, NumberFormat.UInt8BE)
}

enum enMCAiType {
    //% block="Classify Mode"
    type1 = 1,
    //% block="Detect Mode"
    type2 = 2
}


namespace AI_Vision_MC {
    //% blockId=MCSetMode 
    //% block="Switch vision module to %choicetype"
    //%  weight=101
    export function SetMode(choicetype: enMCAiType): void {
        let buf = pins.createBuffer(2)
        buf[0] = 0x00      //运行模式
        buf[1] = choicetype
        pins.i2cWriteBuffer(MC_ADDRESS, buf);
    }

    //% blockId=MCSetClassifyModel
    //% block="set classify model path %path"
    //% weight=90
    //% group="Classify Mode"
    export function setClassifyModel(path: string): void {
        let pathBuf = control.createBufferFromUTF8(path)
        if (pathBuf.length > 127)
            return

        //写长度
        writeReg(CLASS_LEN, pathBuf.length)

        //写路径
        let buf = pins.createBuffer(pathBuf.length + 1)
        buf[0] = CLASS_PATH

        for (let i = 0; i < pathBuf.length; i++) {
            buf[i + 1] = pathBuf[i]
        }

        pins.i2cWriteBuffer(MC_ADDRESS, buf)
    }

    //% blockId=MCLoadClassifyModel
    //% block="load classify model"
    //% weight=89
    //% group="Classify Mode"
    export function loadClassifyModel(): void {
        writeReg(CLASS_CTRL, 1)
    }

    //% blockId=MCClassifyID
    //% block="classify id"
    //% weight=88
    //% group="Classify Mode"
    export function classifyID(): number {
        return readReg(CLASS_ID)
    }

    //% blockId=MCClassifyState
    //% block="classify state"
    //% weight=87
    //% group="Classify Mode"
    export function classifyState(): number {
        return readReg(CLASS_CTRL)
    }

}