function updateClock() {
    const now = new Date();

    const seconds = now.getSeconds();
    const secondDegree = seconds * 6;

    const minutes = now.getMinutes();
    const minuteDegree = minutes * 6 + seconds * 0.1;

    const hours = now.getHours();
    const hourDegree = ((hours % 12) / 12) * 360 + (minutes / 60) * 30;

    document.getElementById('secondHand').style.transform = `rotate(${secondDegree}deg)`;
    document.getElementById('minuteHand').style.transform = `rotate(${minuteDegree}deg)`;
  document.getElementById('hourHand').style.transform = `rotate(${hourDegree}deg)`;
}
setInterval(updateClock, 1000);
updateClock();