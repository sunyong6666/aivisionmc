const MC_ADDRESS = 0x24

// 分类基地址
const CLASS_BASE = 15
// 分类地址
const CLASS_CTRL = CLASS_BASE + 0x00      
const CLASS_LEN = CLASS_BASE + 0x01       
const CLASS_PATH = CLASS_BASE + 0x02     
const CLASS_ID = CLASS_BASE + 0x03        
const CLASS_SCORE = CLASS_BASE + 0x04

// 检测基地址
const DETECT_BASE = 30
// 分类地址
const DETECT_CTRL = DETECT_BASE + 0x00
const DETECT_LEN = DETECT_BASE + 0x01
const DETECT_PATH = DETECT_BASE + 0x02
const DETECT_ANCHOR_LEN = DETECT_BASE + 0x03
const DETECT_ANCHOR = DETECT_BASE + 0x04
const DETECT_COUNT = DETECT_BASE + 0x05
const DETECT_OBJ1 = DETECT_BASE + 0x06
const DETECT_OBJ2 = DETECT_BASE + 0x07
const DETECT_OBJ3 = DETECT_BASE + 0x08
const DETECT_OBJ4 = DETECT_BASE + 0x09
const DETECT_CLASSES = DETECT_BASE + 0x0A
const DETECT_PARAM = DETECT_BASE + 0x0B

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

function readBuffer(reg: number, len: number): Buffer {
    pins.i2cWriteNumber(MC_ADDRESS, reg, NumberFormat.UInt8BE)
    return pins.i2cReadBuffer(MC_ADDRESS, len)
}

function getDetectObject(obj: DetectObject): Buffer {
    return readBuffer(DETECT_OBJ1 + obj, 9)
}

enum enMCAiType {
    //% block="Classify Mode"
    type1 = 1,
    //% block="Detect Mode"
    type2 = 2
}

enum DetectObject {
    //% block="Object 1"
    Object1 = 0,
    //% block="Object 2"
    Object2 = 1,
    //% block="Object 3"
    Object3 = 2,
    //% block="Object 4"
    Object4 = 3
}

enum DetectData {
    //% block="ID"
    ID = 0,
    //% block="Center X"
    CenterX,
    //% block="Center Y"
    CenterY,
    //% block="Width"
    Width,
    //% block="Height"
    Height
}

//% color="#4B7BEC"
//% icon="\uf03e"
//% block="AI Vision MC" 
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
    //% path.defl="/sd/model.kmodel"
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

    //--------------------------检测模式---------------------
    //% blockId=MCSetDetectModel
    //% block="set detect model path %path"
    //% path.defl="/sd/model.kmodel"
    //% weight=80
    //% group="Detect Mode"
    export function setDetectModel(path: string): void {
        let pathBuf = control.createBufferFromUTF8(path)

        if (pathBuf.length > 127)
            return

        writeReg(DETECT_LEN, pathBuf.length)

        let buf = pins.createBuffer(pathBuf.length + 1)
        buf[0] = DETECT_PATH

        for (let i = 0; i < pathBuf.length; i++) {
            buf[i + 1] = pathBuf[i]
        }

        pins.i2cWriteBuffer(MC_ADDRESS, buf)
    }

    //设置 Anchor
    //% blockId=MCSetDetectAnchor
    //% block="set detect anchor %anchor"
    //% weight=79
    //% group="Detect Mode"
    export function setDetectAnchor(anchor: string): void {
        let bufAnchor = control.createBufferFromUTF8(anchor)

        if (bufAnchor.length > 200)
            return

        writeReg(DETECT_ANCHOR_LEN, bufAnchor.length)

        let buf = pins.createBuffer(bufAnchor.length + 1)
        buf[0] = DETECT_ANCHOR

        for (let i = 0; i < bufAnchor.length; i++) {
            buf[i + 1] = bufAnchor[i]
        }

        pins.i2cWriteBuffer(MC_ADDRESS, buf)
    }

    //设置类别数
    //% blockId=MCSetDetectClasses
    //% block="set detect classes %count"
    //% weight=78
    //% group="Detect Mode"
    export function setDetectClasses(count: number): void {
        writeReg(DETECT_CLASSES, count)
    }

    //加载模型
    //% blockId=MCLoadDetectModel
    //% block="load detect model"
    //% weight=77
    //% group="Detect Mode"
    export function loadDetectModel(): void {
        writeReg(DETECT_CTRL, 1)
    }

    //获取状态
    // //% blockId=MCDetectState
    // //% block="detect state"
    // //% weight=76
    // //% group="Detect Mode"
    // export function detectState(): number {
    //     return readReg(DETECT_CTRL)
    // }

    //获取检测数量
    //% blockId=MCDetectCount
    //% block="detect count"
    //% weight=75
    //% group="Detect Mode"
    export function detectCount(): number {
        return readReg(DETECT_COUNT)
    }

    //获取类别信息
    //% blockId=MCGetDetectData
    //% block="get %data of %obj"
    //% weight=74
    //% group="Detect Mode"
    export function getDetectData(data: DetectData, obj: DetectObject): number {

        let buf = getDetectObject(obj)

        switch (data) {

            case DetectData.ID:
                return buf[0]

            case DetectData.CenterX:
                return (buf[1] << 8) | buf[2]

            case DetectData.CenterY:
                return (buf[3] << 8) | buf[4]

            case DetectData.Width:
                return (buf[5] << 8) | buf[6]

            case DetectData.Height:
                return (buf[7] << 8) | buf[8]
        }

        return 0
    }

}