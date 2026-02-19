let trips = [];

document.getElementById("addBtn").addEventListener("click", addTrip);

function addTrip(){
  trips.push({start:"", end:""});
  render();
}

function removeTrip(i){
  trips.splice(i,1);
  render();
}

function render(){
  const container = document.getElementById("trips");
  container.innerHTML = "";

  trips.forEach((t,i)=>{
    const row = document.createElement("div");
    row.className = "trip";
    row.innerHTML = `
      <input type="date" value="${t.start}" />
      <input type="date" value="${t.end}" />
      <button>🗑️</button>
    `;

    const inputs = row.querySelectorAll("input");
    inputs[0].addEventListener("change", e => { trips[i].start = e.target.value; calculate(); });
    inputs[1].addEventListener("change", e => { trips[i].end = e.target.value; calculate(); });
    row.querySelector("button").addEventListener("click", () => removeTrip(i));

    container.appendChild(row);
  });

  calculate();
}

function mergeTrips(list){
  let arr = list
    .filter(t=>t.start && t.end)
    .map(t=>({start:new Date(t.start), end:new Date(t.end)}))
    .sort((a,b)=>a.start-b.start);

  let merged=[];
  for(let t of arr){
    if(!merged.length || t.start > merged[merged.length-1].end){
      merged.push({...t});
    }else{
      merged[merged.length-1].end = new Date(
        Math.max(merged[merged.length-1].end, t.end)
      );
    }
  }
  return merged;
}

function calculate(){
  const today = new Date();
  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - 179);

  let merged = mergeTrips(trips);
  let used = 0;

  for(let t of merged){
    let s = new Date(Math.max(t.start, windowStart));
    let e = new Date(Math.min(t.end, today));

    if(s <= e){
      used += Math.floor((e - s)/(1000*60*60*24)) + 1;
    }
  }

  let remaining = 90 - used;

  document.getElementById("used").innerText = used;
  document.getElementById("remaining").innerText = Math.max(0, remaining);

  const riskBox = document.getElementById("risk");

  if(used > 90){
    riskBox.innerText = "Overstay Risk";
    riskBox.className = "card red";
  }else{
    riskBox.innerText = "Compliant";
    riskBox.className = "card green";
  }

  // Next entry date
  let checkDate = new Date(today);
  while(true){
    let ws = new Date(checkDate);
    ws.setDate(checkDate.getDate()-179);

    let tempUsed = 0;

    for(let t of merged){
      let s = new Date(Math.max(t.start, ws));
      let e = new Date(Math.min(t.end, checkDate));

      if(s <= e){
        tempUsed += Math.floor((e - s)/(1000*60*60*24)) + 1;
      }
    }

    if(tempUsed <= 90) break;
    checkDate.setDate(checkDate.getDate()+1);
  }

  document.getElementById("next").innerText =
    checkDate.toISOString().split("T")[0];
}

addTrip();
