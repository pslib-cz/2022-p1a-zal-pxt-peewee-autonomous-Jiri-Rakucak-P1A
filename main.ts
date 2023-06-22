let around = false
let connected = 0
let whiteline = 0
radio.setGroup(1)
let speedFactor = 50
let pin_M = DigitalPin.P15
let pin_R = DigitalPin.P14
let pin_L = DigitalPin.P13
let pin_Trig = DigitalPin.P2
let pin_Echo = DigitalPin.P1
pins.setPull(pin_L, PinPullMode.PullNone)
pins.setPull(pin_R, PinPullMode.PullNone)
pins.setPull(pin_M, PinPullMode.PullNone)
let where = 0
let manual = false
let line_follower = true
let speed = 160
let speedL = 155
let speedR = 155
function motor_run(left: number = 0, right: number = 0) {
    PCAmotor.MotorRun(PCAmotor.Motors.M1, left)
    PCAmotor.MotorRun(PCAmotor.Motors.M4, right)
}


radio.onReceivedString(function(receivedString: string) {
    if (receivedString === "forward") { 
        where = 1
    }
    if (receivedString == "left") {
        where = 0}
    
    if (receivedString == "right") {
        where = 2
    }
})

basic.forever(function () {
    let obstacle_distance = sonar.ping(pin_Trig, pin_Echo, PingUnit.Centimeters, 100)
let l = (whiteline ^ pins.digitalReadPin(pin_L)) == 0 ? false : true
let r = (whiteline ^ pins.digitalReadPin(pin_R)) == 0 ? false : true
let m = (whiteline ^ pins.digitalReadPin(pin_M)) == 0 ? false : true
if (line_follower) {
        // jízda na senzory
        if (obstacle_distance <= 15 && obstacle_distance != 0) {
            // když sonar zaznamená méně než 15 cantimetru, otoč servo a znovu změří
            PCAmotor.Servospeed(PCAmotor.Servos.S1, 0, 90, 1)
            basic.pause(1000)
            if (obstacle_distance <= 15 && obstacle_distance != 0) {
                motor_run(199, -130)
                basic.pause(50)

                motor_run(199, 130)
                basic.pause(150)

                motor_run(-199, 130)
                basic.pause(100)

                motor_run(199, 130)
                basic.pause(750)

                motor_run(-199, 130)
                basic.pause(100)

                motor_run(199, 130)
                basic.pause(380)
            } else {
                motor_run(-150, 90)
                basic.pause(50)

                motor_run(150, 90)
                basic.pause(150)

                motor_run(150, -90)
                basic.pause(100)

                motor_run(150, 90)
                basic.pause(750)

                motor_run(150, -90)
                basic.pause(100)

                motor_run(150, 90)
                basic.pause(380)
            }
            around = false
           
        } else if (!m && !l && !r) {
            // couvání
            motor_run(-200 -160)
        } else if (r && l && m) {
            //  když zaznamená pravý, prostřední i levý senzor (křižovatka) =>
            if (where === 0) {
                //  zaboč doleva
                motor_run(0, 160)
                basic.pause(1000)
                
            } else if (where === 2) {
                //  zaboč doprava
                motor_run(200, 0)
                basic.pause(1000)
                
            } else if (where === 1) {
                //  neodbočuj
                motor_run(200, 160)
            }
            where = 1
        } else if (!r && !l && m) {
            // když snímá jenom prostřední senzor => jeď rovně
            motor_run(200, 230)

        } else if (l && m) {
            // zatoč doleva
            motor_run(speedL, 0 )

        } else if (r && m) {
            // zatoč doprava
            motor_run(0, speedR)
        }
    }
    basic.pause(100)
})