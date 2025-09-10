    // State
    const state = {
      array: [],
      running:false,
      paused:false,
      speed:80,
      size:40,
      mode:'single',
      algo1:'quick',
      algo2:'quick'
    };

    // DOM refs
    const vis1 = document.getElementById('vis1'), visL = document.getElementById('visL'), visR = document.getElementById('visR');
    const comp1 = document.getElementById('comp1'), swp1 = document.getElementById('swp1'), time1 = document.getElementById('time1');
    const compL = document.getElementById('compL'), swpL = document.getElementById('swpL'), timeL = document.getElementById('timeL');
    const compR = document.getElementById('compR'), swpR = document.getElementById('swpR'), timeR = document.getElementById('timeR');
    const liveAlgo = document.getElementById('liveAlgo'), liveComp = document.getElementById('liveComp'), liveSwap = document.getElementById('liveSwap'), liveTime = document.getElementById('liveTime');

    // Controls
    document.getElementById('size').addEventListener('input', e=>{ state.size = +e.target.value; generateArray(); });
    document.getElementById('speed').addEventListener('change', e=>{ state.speed = +e.target.value; });
    document.getElementById('mode').addEventListener('change', e=>{ state.mode = e.target.value; toggleMode(); });
    document.getElementById('algo1').addEventListener('change', e=>{ state.algo1 = e.target.value; updateInfo(1,e.target.value); });
    document.getElementById('algo2').addEventListener('change', e=>{ state.algo2 = e.target.value; updateInfo(2,e.target.value); });
    document.getElementById('arrayType').addEventListener('change', generateArray);
    document.getElementById('shuffle').addEventListener('click', generateArray);
    document.getElementById('start').addEventListener('click', start);
    document.getElementById('pause').addEventListener('click', ()=>{ state.paused = !state.paused; document.getElementById('pause').textContent = state.paused ? 'Resume' : 'Pause'; });
    document.getElementById('reset').addEventListener('click', resetAll);

    // modal buttons
    const modalBackdrop = document.getElementById('modalBackdrop');
    const closeResultBtn = document.getElementById('closeResultBtn');
    const rerunBtn = document.getElementById('rerunBtn');
    if(closeResultBtn) closeResultBtn.addEventListener('click', closeResultCard);
    if(rerunBtn) rerunBtn.addEventListener('click', ()=>{ closeResultCard(); start(); });

    // initial setup
    updateInfo(1,'quick'); updateInfo(2,'quick'); generateArray();

    function toggleMode(){
      const m = state.mode;
      document.getElementById('singleView').style.display = m==='single'? 'block':'none';
      document.getElementById('compareView').style.display = m==='compare'? 'block':'none';
      document.getElementById('info2').style.display = m==='compare'? 'block':'none';
      document.getElementById('liveAlgo').textContent = m==='single'? prettyName(state.algo1): 'Comparison';
    }

    function prettyName(k){ return ({bubble:'Bubble Sort', selection:'Selection Sort', insertion:'Insertion Sort', merge:'Merge Sort', quick:'Quick Sort', heap:'Heap Sort'})[k]||k; }

    function updateInfo(n,algo){
      const map = {
        bubble:{best:'Ω(n)',avg:'Θ(n^2)',worst:'O(n^2)',space:'O(1)'},
        selection:{best:'Ω(n^2)',avg:'Θ(n^2)',worst:'O(n^2)',space:'O(1)'},
        insertion:{best:'Ω(n)',avg:'Θ(n^2)',worst:'O(n^2)',space:'O(1)'},
        merge:{best:'Ω(n log n)',avg:'Θ(n log n)',worst:'O(n log n)',space:'O(n)'},
        quick:{best:'Ω(n log n)',avg:'Θ(n log n)',worst:'O(n^2)',space:'O(log n)'},
        heap:{best:'Ω(n log n)',avg:'Θ(n log n)',worst:'O(n log n)',space:'O(1)'}
      };
      const info = map[algo];
      document.getElementById('name'+n).textContent = prettyName(algo);
      document.getElementById('best'+n).textContent = info.best;
      document.getElementById('avg'+n).textContent = info.avg;
      document.getElementById('worst'+n).textContent = info.worst;
      document.getElementById('space'+n).textContent = info.space;
      document.getElementById('liveAlgo').textContent = state.mode==='single' && n===1 ? prettyName(algo) : (state.mode==='compare' ? 'Comparison' : document.getElementById('liveAlgo').textContent);
    }

    function generateArray(){
      const n = state.size;
      let arr = [];
      for(let i=0;i<n;i++) arr.push(Math.floor(Math.random()*100)+1);
      const t = document.getElementById('arrayType').value;
      if(t==='reversed') arr = arr.sort((a,b)=>b-a);
      if(t==='sorted') arr = arr.sort((a,b)=>a-b);
      if(t==='nearly'){ arr = arr.sort((a,b)=>a-b); for(let i=0;i<Math.max(1,Math.floor(n*0.05));i++){const i1=Math.floor(Math.random()*n); const i2=Math.floor(Math.random()*n); [arr[i1],arr[i2]]=[arr[i2],arr[i1]] }}
      state.array = arr.slice();
      render();
    }

    function render(){
      const arr = state.array;
      vis1.innerHTML=''; visL.innerHTML=''; visR.innerHTML='';
      const max = Math.max(...arr,1);
      function makeBars(container,arr){
        const w = Math.max(2, Math.floor(container.clientWidth/Math.max(1,arr.length))-2);
        arr.forEach((v,i)=>{
          const bar = document.createElement('div');
          bar.className='bar';
          bar.style.height = Math.max(6, Math.floor((v/max)*(container.clientHeight-10))) + 'px';
          bar.style.flex = '0 0 '+w+'px';
          bar.dataset.index = i;
          container.appendChild(bar);
        })
      }
      makeBars(vis1,arr); makeBars(visL,arr); makeBars(visR,arr);
    }

    // sleep that respects pause
    function sleep(ms){
      if(ms===0) return Promise.resolve();
      return new Promise(resolve=>{
        const start = Date.now();
        (function tick(){
          if(state.paused){ setTimeout(tick,100); return; }
          if(Date.now()-start >= ms) return resolve();
          setTimeout(tick, Math.min(50,ms));
        })();
      });
    }

    // DOM markers
    function mark(container,i,cls){ const a = container.children[i]; if(a) a.classList.add(cls); }
    function unmark(container,i,cls){ const a = container.children[i]; if(a) a.classList.remove(cls); }
    function setSorted(container,i){ const a = container.children[i]; if(a) a.classList.add('sorted'); }

    // swap heights
    function swapHeights(container,i,j){
      const a = container.children[i], b = container.children[j];
      if(!a||!b) return;
      const ah=a.style.height, bh=b.style.height;
      a.style.height = bh; b.style.height = ah;
    }
    function setHeightByValue(container,i,val,arrRef){
      const a = container.children[i]; if(!a) return;
      const max = Math.max(...arrRef,1);
      a.style.height = Math.max(6, Math.floor((val/max)*(container.clientHeight-10))) + 'px';
    }

    // Algorithms (instrumented)
    async function bubble(A, container, ops, onUpdate){
      const n=A.length;
      for(let i=0;i<n;i++){
        for(let j=0;j<n-i-1;j++){
          ops.comp++; onUpdate();
          mark(container,j,'compare'); mark(container,j+1,'compare');
          await sleep(state.speed);
          if(A[j]>A[j+1]){ ops.swap++; onUpdate(); mark(container,j,'swap'); mark(container,j+1,'swap'); await sleep(state.speed); [A[j],A[j+1]]=[A[j+1],A[j]]; swapHeights(container,j,j+1); unmark(container,j,'swap'); unmark(container,j+1,'swap'); }
          unmark(container,j,'compare'); unmark(container,j+1,'compare');
        }
        setSorted(container,n-i-1);
      }
    }

    async function selection(A, container, ops, onUpdate){
      const n=A.length;
      for(let i=0;i<n;i++){
        let min=i;
        for(let j=i+1;j<n;j++){ ops.comp++; onUpdate(); mark(container,min,'compare'); mark(container,j,'compare'); await sleep(state.speed); if(A[j]<A[min]){ unmark(container,min,'compare'); min=j; mark(container,min,'compare'); } unmark(container,j,'compare'); }
        if(min!==i){ ops.swap++; onUpdate(); mark(container,i,'swap'); mark(container,min,'swap'); await sleep(state.speed); [A[i],A[min]]=[A[min],A[i]]; swapHeights(container,i,min); unmark(container,i,'swap'); unmark(container,min,'swap'); }
        setSorted(container,i);
      }
    }

    async function insertion(A, container, ops, onUpdate){
      const n=A.length;
      for(let i=1;i<n;i++){
        let key=A[i]; let j=i-1;
        while(j>=0 && (ops.comp++, onUpdate(), A[j]>key)){
          mark(container,j,'compare'); mark(container,j+1,'compare'); await sleep(state.speed);
          A[j+1]=A[j]; swapHeights(container,j,j+1);
          unmark(container,j,'compare'); unmark(container,j+1,'compare');
          ops.swap++; onUpdate(); j--; await sleep(state.speed);
        }
        A[j+1]=key; setSorted(container,i);
      }
    }

    async function mergeSort(A,l,r,container,ops,onUpdate){
      if(l>=r) return;
      const m = Math.floor((l+r)/2);
      await mergeSort(A,l,m,container,ops,onUpdate);
      await mergeSort(A,m+1,r,container,ops,onUpdate);
      const left=A.slice(l,m+1), right=A.slice(m+1,r+1);
      let i=0,j=0,k=l;
      while(i<left.length && j<right.length){
        ops.comp++; onUpdate(); await sleep(state.speed);
        if(left[i]<=right[j]){ A[k]=left[i++]; } else { A[k]=right[j++]; }
        setHeightByValue(container,k,A[k],A); onUpdate(); k++; await sleep(state.speed);
      }
      while(i<left.length){ A[k]=left[i++]; setHeightByValue(container,k,A[k],A); k++; await sleep(state.speed); }
      while(j<right.length){ A[k]=right[j++]; setHeightByValue(container,k,A[k],A); k++; await sleep(state.speed); }
      for(let x=l;x<=r;x++) setSorted(container,x);
    }

    async function quickSort(A,l,r,container,ops,onUpdate){
      if(l>=r) return;
      const p = await partition(A,l,r,container,ops,onUpdate);
      await quickSort(A,l,p-1,container,ops,onUpdate);
      await quickSort(A,p+1,r,container,ops,onUpdate);
    }
    async function partition(A,l,r,container,ops,onUpdate){
      const pivot = A[r]; let i=l;
      for(let j=l;j<r;j++){ ops.comp++; onUpdate(); mark(container,j,'compare'); mark(container,r,'compare'); await sleep(state.speed);
        if(A[j]<pivot){ ops.swap++; onUpdate(); mark(container,i,'swap'); mark(container,j,'swap'); await sleep(state.speed); [A[i],A[j]]=[A[j],A[i]]; swapHeights(container,i,j); unmark(container,i,'swap'); unmark(container,j,'swap'); i++; }
        unmark(container,j,'compare'); unmark(container,r,'compare');
      }
      ops.swap++; onUpdate(); mark(container,i,'swap'); mark(container,r,'swap'); await sleep(state.speed); [A[i],A[r]]=[A[r],A[i]]; swapHeights(container,i,r); unmark(container,i,'swap'); unmark(container,r,'swap');
      setSorted(container,i);
      return i;
    }

    async function heapSort(A,container,ops,onUpdate){
      const n=A.length;
      function heapify(n,i){
        let largest=i; let l=2*i+1; let r=2*i+2;
        if(l<n && A[l]>A[largest]) largest=l;
        if(r<n && A[r]>A[largest]) largest=r;
        if(largest!==i){ [A[i],A[largest]]=[A[largest],A[i]]; heapify(n,largest); }
      }
      for(let i=Math.floor(n/2)-1;i>=0;i--) heapify(n,i);
      for(let i=n-1;i>0;i--){ [A[0],A[i]]=[A[i],A[0]]; swapHeights(container,0,i); setSorted(container,i); await sleep(state.speed); }
      setSorted(container,0);
    }

    // Runner helpers
    async function runSingleAlgo(){
      state.algo1 = document.getElementById('algo1').value;
      const base = state.array.slice();
      const ops = {comp:0,swap:0};
      comp1.textContent='0'; swp1.textContent='0'; time1.textContent='0ms'; liveComp.textContent='0'; liveSwap.textContent='0'; liveTime.textContent='0ms';
      const startT = performance.now();
      if(state.algo1==='bubble') await bubble(base,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      else if(state.algo1==='selection') await selection(base,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      else if(state.algo1==='insertion') await insertion(base,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      else if(state.algo1==='merge') await mergeSort(base,0,base.length-1,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      else if(state.algo1==='quick') await quickSort(base,0,base.length-1,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      else if(state.algo1==='heap') await heapSort(base,vis1,ops,()=>{ comp1.textContent=ops.comp; swp1.textContent=ops.swap; liveComp.textContent=ops.comp; liveSwap.textContent=ops.swap; });
      const endT = performance.now(); time1.textContent = Math.round(endT-startT) + 'ms'; liveTime.textContent = Math.round(endT-startT) + 'ms';
      state.running=false;
    }

    async function runComparison(){
      state.algo1 = document.getElementById('algo1').value; state.algo2 = document.getElementById('algo2').value;
      const baseA = state.array.slice(), baseB = state.array.slice();
      const opsA = {comp:0,swap:0}, opsB = {comp:0,swap:0};
      compL.textContent='0'; swpL.textContent='0'; timeL.textContent='0ms'; compR.textContent='0'; swpR.textContent='0'; timeR.textContent='0ms';
      const leftRunner = (async ()=>{
        const t0 = performance.now();
        if(state.algo1==='bubble') await bubble(baseA,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        else if(state.algo1==='selection') await selection(baseA,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        else if(state.algo1==='insertion') await insertion(baseA,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        else if(state.algo1==='merge') await mergeSort(baseA,0,baseA.length-1,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        else if(state.algo1==='quick') await quickSort(baseA,0,baseA.length-1,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        else if(state.algo1==='heap') await heapSort(baseA,visL,opsA,()=>{ compL.textContent=opsA.comp; swpL.textContent=opsA.swap; });
        const t1 = performance.now(); timeL.textContent = Math.round(t1-t0)+'ms';
        return {ops:opsA, time: Math.round(t1-t0), name: prettyName(state.algo1)};
      })();
      const rightRunner = (async ()=>{
        const t0 = performance.now();
        if(state.algo2==='bubble') await bubble(baseB,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        else if(state.algo2==='selection') await selection(baseB,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        else if(state.algo2==='insertion') await insertion(baseB,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        else if(state.algo2==='merge') await mergeSort(baseB,0,baseB.length-1,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        else if(state.algo2==='quick') await quickSort(baseB,0,baseB.length-1,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        else if(state.algo2==='heap') await heapSort(baseB,visR,opsB,()=>{ compR.textContent=opsB.comp; swpR.textContent=opsB.swap; });
        const t1 = performance.now(); timeR.textContent = Math.round(t1-t0)+'ms';
        return {ops:opsB, time: Math.round(t1-t0), name: prettyName(state.algo2)};
      })();

      const [resL, resR] = await Promise.all([leftRunner, rightRunner]);
      // show popup with results
      showResultCard(resL, resR);
      state.running=false;
    }

    // Start handler
    async function start(){
      if(state.running) return;
      state.running=true; state.paused=false; document.getElementById('pause').textContent='Pause';
      state.speed = +document.getElementById('speed').value;
      state.size = +document.getElementById('size').value;
      state.mode = document.getElementById('mode').value;
      render(); // ensure visuals match
      if(state.mode==='single'){ document.getElementById('singleView').style.display='block'; document.getElementById('compareView').style.display='none'; await runSingleAlgo(); }
      else { document.getElementById('singleView').style.display='none'; document.getElementById('compareView').style.display='block'; await runComparison(); }
    }

    function resetAll(){
      state.running=false; state.paused=false; document.getElementById('pause').textContent='Pause'; generateArray();
      comp1.textContent='0'; swp1.textContent='0'; time1.textContent='0ms'; compL.textContent='0'; swpL.textContent='0'; timeL.textContent='0ms'; compR.textContent='0'; swpR.textContent='0'; timeR.textContent='0ms'; liveComp.textContent='0'; liveSwap.textContent='0'; liveTime.textContent='0ms';
    }

    // Result popup
    function showResultCard(leftRes, rightRes){
      const container = document.getElementById('modalBackdrop');
      const content = document.getElementById('resultContent');
      content.innerHTML = `
        <div class="row"><strong>${leftRes.name}</strong><span>${leftRes.time}ms</span></div>
        <div class="muted small">Comparisons: ${leftRes.ops.comp} &nbsp; Swaps: ${leftRes.ops.swap}</div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:8px 0">
        <div class="row"><strong>${rightRes.name}</strong><span>${rightRes.time}ms</span></div>
        <div class="muted small">Comparisons: ${rightRes.ops.comp} &nbsp; Swaps: ${rightRes.ops.swap}</div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.04);margin:8px 0">
        <div style="text-align:center;font-weight:600;color:${leftRes.time < rightRes.time ? 'lightgreen' : 'lightcoral'}">${leftRes.time === rightRes.time ? 'Tie' : (leftRes.time < rightRes.time ? leftRes.name + ' was faster' : rightRes.name + ' was faster')}</div>
      `;
      container.style.display='flex';
      document.getElementById('resultCard').classList.remove('hidden');
      // also set backdrop visible
      modalBackdrop.style.display='flex';
    }

    function closeResultCard(){
      modalBackdrop.style.display='none';
      document.getElementById('resultCard').classList.add('hidden');
    }

    // Hook resize to re-render bars sizes
    window.addEventListener('resize', render);
    // init
    generateArray(); // calls render