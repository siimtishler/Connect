import { ConnectFour } from "./connectfour.js"


const settingsButtonGroups = document.querySelectorAll('.settings');
const startButton = document.querySelector('.settings.start');

const settingsFilteredButtons = Array.from(settingsButtonGroups).filter(button => button !== startButton)

const selectedSettings = {}

settingsFilteredButtons.forEach(button => {
    if(button.className.includes('focused')){
        selectedSettings[button.className] = button.innerText
    }
    button.addEventListener('click', function () {
        const parentWrapper = this.parentElement;
        const buttonsInGroup = parentWrapper.querySelectorAll('.settings');
        buttonsInGroup.forEach(b => {
            if (b !== this) {
                b.classList.remove('focused');
            }
        });
        this.classList.add('focused');
        selectedSettings[this.className] = this.innerText
    });
});

const Game = new ConnectFour()

startButton.addEventListener('click', (btn) => {
    if(startButton.innerText === 'Start'){
        Game.Start(Object.values(selectedSettings))
        startButton.innerText = 'Restart'
    }
    else if(startButton.innerText === 'Restart'){
        Game.Clear()
        startButton.innerText = 'Start'
    }
    console.log(selectedSettings)
})

