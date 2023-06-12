// nastavení základních parametrů
radio.setGroup(1)

let speedFactor = 50
let pin_M = DigitalPin.P15
let pin_R = DigitalPin.P14
let pin_L = DigitalPin.P13
let pin_Trig = DigitalPin.P2
let pin_Echo = DigitalPin.P1
let whiteline = 0
let connected = 0
pins.setPull(pin_L, PinPullMode.PullNone)
pins.setPull(pin_R, PinPullMode.PullNone)
pins.setPull(pin_M, PinPullMode.PullNone)
let where = "forward"
let manual = false
let line_follower = true
let speed = 160
let around = false
//  Funkce na zlehčení použití motorů
function motor_run(left: number = 0, right: number = 0) {
    PCAmotor.MotorRun(PCAmotor.Motors.M1, Math.map(Math.constrain(-1 * left * (speedFactor / 100), -100, 100), -100, 100, -199, 199))
    PCAmotor.MotorRun(PCAmotor.Motors.M4, Math.map(Math.constrain(-1 * right * (speedFactor / 100), -100, 100), -100, 100, -130, 130))
}


radio.onReceivedString(function(receivedString: string) {
    if (receivedString === "forward") { 
        where = "forward" 
        basic.showLeds(`
    . . # . .
    . # # # .
    # . # . #
    . . # . .
    . . # . .
    `)}
    
    if (receivedString === "left") { 
        where = "left"
        basic.showLeds(`
    . . # . .
    . # . . .
    # # # # #
    . # . . .
    . . # . .
    `) }
    if (receivedString === "right") { 
        where = "right"
        basic.showLeds(`
    . . # . .
    . . . # .
    # # # # #
    . . . # .
    . . # . .
    `)
    } }
)

basic.forever(function on_forever() {

    let obstacle_distance = sonar.ping(pin_Trig, pin_Echo, PingUnit.Centimeters, 100)
    let l = (whiteline ^ pins.digitalReadPin(pin_L)) == 0 ? false : true
    let r = (whiteline ^ pins.digitalReadPin(pin_R)) == 0 ? false : true
    let m = (whiteline ^ pins.digitalReadPin(pin_M)) == 0 ? false : true

    if (line_follower) {
        // jízda na senzory
        if (obstacle_distance <= 15 && obstacle_distance != 0) {
            //  když sonar zaznamená méně než 15 cm
            if (!around) {
                //  => otoč se
                motor_run(160, -160)
                basic.pause(400)
            } else {
                //  => objet objekt 20x20x20 ...
                motor_run(199, -160)
                basic.pause(50)
                // doprava
                motor_run(199, 160)
                basic.pause(150)
                // rovně
                motor_run(-199, 160)
                basic.pause(100)
                // doleva
                motor_run(199, 160)
                basic.pause(750)
                // rovně
                motor_run(-199, 140)
                basic.pause(100)
                // doleva
                motor_run(199, 140)
                basic.pause(380)
                // rovně
                motor_run(199, 130)
                basic.pause(100)
            }

            // doleva
            around = false
        } else if (!m && !l && !r) {
            // couvání, který nefunguje
            motor_run(-199, -130)
        } else if (r && l && m) {
            //  když zaznamená pravý, prostřední i levý senzor (křižovatka) =>
            if (where == "left") {
                //  zaboč doleva
                motor_run(-199, 255)
                basic.pause(50)
                
            } else if (where == "right") {
                //  zaboč doprava
                motor_run(255, -130)
                basic.pause(50)
                
            } else if (where == "forward") {
                //  neodbočuj
                motor_run(199, 160)
            }

            where = "forward"
        } else if (!r && !l && m) {
            // když snímá jenom prostřední senzor => jeď rovně
            motor_run(199, 170)
        } else if (l && m) {
            //  když levý a prostřední senzor snímá čáru => zaboč doleva
            motor_run(100, -100)
        } else if (r && m) {
            //  když pravý a prostřední senzor snímá čáru => zaboč doprava
            motor_run(-100, 100)
        }

    }

})