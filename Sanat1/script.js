const canvas = document.getElementById('sanatTuvali'); // HTML'deki 'sanatTuvali' ID'sine sahip kanvas elementini seçtim.
const ctx = canvas.getContext('2d'); // Kanvasın 2D çizim bağlamını (context) aldım.
 
// UI Elemanları (Türkçe ID'lere göre güncellendi)
 
const renkSecici = document.getElementById('renkSecici'); // 'renkSecici' ID'sine sahip renk seçiciyi seçtim.
const parcacikYogunluguSlider = document.getElementById('parcacikYogunlugu'); // 'parcacikYogunlugu' ID'sine sahip kaydırma çubuğunu seçtim.
const parcacikHiziSlider = document.getElementById('parcacikHizi'); // 'parcacikHizi' ID'sine sahip kaydırma çubuğunu seçtim.
const simetriSlider = document.getElementById('simetri'); // 'simetri' ID'sine sahip kaydırma çubuğunu seçtim.
const kaybolmaHiziSlider = document.getElementById('kaybolmaHizi'); // 'kaybolmaHizi' ID'sine sahip kaydırma çubuğunu seçtim.
const temizleDugmesi = document.getElementById('temizleDugmesi'); // 'temizleDugmesi' ID'sine sahip düğmeyi seçtim.
const kaydetDugmesi = document.getElementById('kaydetDugmesi'); // 'kaydetDugmesi' ID'sine sahip düğmeyi seçtim.
 
// Çizim Değişkenleri
 
let isDrawing = false; // Çizim yapılıp yapılmadığını takip eden bir boolean değişkeni oluşturdum.
let particles = []; // Tüm aktif parçacıkları tutacak boş bir dizi oluşturdum.
let currentColor = renkSecici.value; // Şu anki çizim rengini renk seçiciden aldım.
let currentParticleCount = parseInt(parcacikYogunluguSlider.value); // Şu anki parçacık yoğunluğunu kaydırma çubuğundan sayı olarak aldım.
let currentParticleSpeed = parseFloat(parcacikHiziSlider.value); // Şu anki parçacık hızını kaydırma çubuğundan ondalıklı sayı olarak aldım.
let symmetryAxes = parseInt(simetriSlider.value); // Simetri eksenlerinin sayısını kaydırma çubuğundan sayı olarak aldım.
let currentFadeSpeed = parseFloat(kaybolmaHiziSlider.value); // Arka planın kaybolma hızını kaydırma çubuğundan ondalıklı sayı olarak aldım.
 
// Canvas Boyutlandırma
 
function resizeCanvas() { // Kanvasın boyutunu ayarlayan fonksiyonu tanımladım.
    canvas.width = window.innerWidth; // Kanvasın genişliğini pencerenin iç genişliği kadar yaptım.
    canvas.height = window.innerHeight; // Kanvasın yüksekliğini pencerenin iç yüksekliği kadar yaptım.
    // Yeniden boyutlandığında tuvali temizle ve parçacıkları sıfırla
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Kanvası tamamen temizledim.
    particles = []; // Tüm parçacıkları sıfırladım.
}
window.addEventListener('resize', resizeCanvas); // Pencere boyutu değiştiğinde resizeCanvas fonksiyonunu çağırdım.
resizeCanvas(); // Sayfa ilk yüklendiğinde kanvasın boyutunu ayarladım.
 
// Parçacık Sınıfı (Particle Class)
 
class Particle {
    constructor(x, y, color, speed) { // Parçacığın başlangıç özelliklerini belirledim.
 
        this.x = x; // Parçacığın x koordinatını ayarladım.
        this.y = y; // Parçacığın y koordinatını ayarladım.
        this.color = color; // Parçacığın rengini ayarladım.
        this.speed = speed; // Parçacığın hızını ayarladım.
        this.size = Math.random() * 5 + 2; // Parçacığın boyutunu rastgele (2-7 arası) ayarladım.
        this.life = 100; // Parçacığın ömrünü (kare sayısı) 100 olarak belirledim.
        this.opacity = 1; // Başlangıç opaklığını 1 (tamamen görünür) olarak ayarladım.
 
        // Rastgele yön ve hız
 
        this.vx = (Math.random() - 0.5) * this.speed * 2; // X eksenindeki hızını rastgele ayarladım.
        this.vy = (Math.random() - 0.5) * this.speed * 2; // Y eksenindeki hızını rastgele ayarladım.
 
        // Yönü biraz daha içeriye doğru çekmek için hafif bir merkez çekimi
       
        const angleToCenter = Math.atan2(canvas.height / 2 - this.y, canvas.width / 2 - this.x); // Parçacıktan merkeze olan açıyı hesapladım.
        this.vx += Math.cos(angleToCenter) * 0.1; // Merkeze doğru hafif bir x hızı ekledim.
        this.vy += Math.sin(angleToCenter) * 0.1; // Merkeze doğru hafif bir y hızı ekledim.
    }
 
    update() { // Parçacığın konumunu ve ömrünü güncelleyen fonksiyonu tanımladım.
 
        this.x += this.vx; // X koordinatını hızına göre güncelledim.
        this.y += this.vy; // Y koordinatını hızına göre güncelledim.
        this.life -= 1; // Parçacığın ömrünü 1 azalttım.
        this.opacity = this.life / 100; // Ömrüne göre opaklığını ayarladım (ömür azaldıkça şeffaflaşacak).
    }
 
    draw() { // Parçacığı kanvasa çizen fonksiyonu tanımladım.
 
        ctx.save(); // Mevcut kanvas durumunu kaydettim (dönüşümler, renkler vb.).
 
        // Parçacık rengini ve opaklığını ayarla
 
        ctx.fillStyle = this.color; // Çizim rengini parçacığın rengi olarak ayarladım.
        ctx.globalAlpha = this.opacity * 0.5; // Parçacığın kendi opaklığına ek olarak genel bir opaklık daha uyguladım (daha şeffaf görünmesi için).
 
        // Parçacığı bir daire olarak çiz
 
        ctx.beginPath(); // Yeni bir çizim yolu başlattım.
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); // Parçacığı daire olarak çizdim.
        ctx.fill(); // Çizilen daireyi içini doldurarak çizdim.
 
        ctx.restore(); // Kaydedilmiş kanvas durumunu geri yükledim (önceki ayarlara döndüm).
    }
}
 
 
function animate() { // Animasyon döngüsünü yöneten fonksiyonu tanımladım.
 
    // Arka planı hafifçe temizleyerek kaybolma efekti yarat
   
    ctx.globalAlpha = currentFadeSpeed; // Arka planı temizlemek için çok düşük bir opaklık ayarladım.
    ctx.fillStyle = '#000'; // Arka plan rengini siyah yaptım.
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Kanvasın tamamını bu düşük opaklıklı siyahla doldurdum.
 
    // Parçacıkları güncelle ve çiz
   
    ctx.globalAlpha = 1; // Parçacıklar için tam opaklık ayarladım (kendi opaklıkları devreye girecek).
    for (let i = particles.length - 1; i >= 0; i--) { // Parçacık dizisini tersten dolaştım (silme işlemi için güvenli).
        const p = particles[i]; // Mevcut parçacığı aldım.
        p.update(); // Parçacığı güncelledim (konum ve ömür).
        p.draw(); // Parçacığı çizdim.
 
        // Ömrü biten parçacıkları kaldır
        if (p.life <= 0) { // Parçacığın ömrü bittiyse.
            particles.splice(i, 1); // Diziden o parçacığı kaldırdım.
        }
    }
 
    requestAnimationFrame(animate); // Tarayıcıya bir sonraki kareyi çizmesini istedim (sonsuz döngü).
}
animate(); // Animasyon döngüsünü başlattım.
 
// Parçacık Oluşturma Fonksiyonu
 
const createParticles = (x, y) => { // Belirtilen x, y koordinatlarında parçacıklar oluşturan fonksiyonu tanımladım.
    const centerX = canvas.width / 2; // Kanvasın merkez x koordinatını hesapladım.
    const centerY = canvas.height / 2; // Kanvasın merkez y koordinatını hesapladım.
 
    for (let i = 0; i < currentParticleCount; i++) { // 'currentParticleCount' kadar ana parçacık oluşturdum.
        for (let j = 0; j < symmetryAxes; j++) { // Her ana parçacık için simetri eksenleri kadar kopya oluşturdum.
            const angle = (Math.PI * 2 / symmetryAxes) * j; // Simetri eksenlerine göre açı hesapladım.
 
            // Fare konumunu merkeze göre döndür
           
            const rotatedX = centerX + (x - centerX) * Math.cos(angle) - (y - centerY) * Math.sin(angle); // Fare konumunu simetri açısına göre x ekseninde döndürdüm.
            const rotatedY = centerY + (x - centerX) * Math.sin(angle) + (y - centerY) * Math.cos(angle); // Fare konumunu simetri açısına göre y ekseninde döndürdüm.
 
            // Her simetri ekseni için yeni parçacıklar ekle
            particles.push(new Particle(rotatedX, rotatedY, currentColor, currentParticleSpeed)); // Yeni bir parçacık oluşturdum ve parçacıklar dizisine ekledim.
        }
    }
};
 
// Fare Olayları
canvas.addEventListener('mousedown', (e) => { // Fare tuşuna basıldığında tetiklenen olay dinleyicisini ekledim.
    isDrawing = true; // Çizim durumunu 'true' yaptım.
    createParticles(e.clientX, e.clientY); // Farenin o anki konumunda parçacıklar oluşturdum.
});
 
canvas.addEventListener('mouseup', () => { // Fare tuşu bırakıldığında tetiklenen olay dinleyicisini ekledim.
    isDrawing = false; // Çizim durumunu 'false' yaptım.
});
 
canvas.addEventListener('mouseout', () => { // Fare kanvasın dışına çıktığında tetiklenen olay dinleyicisini ekledim.
    isDrawing = false; // Çizim durumunu 'false' yaptım (çizimi durdurmak için).
});
 
canvas.addEventListener('mousemove', (e) => { // Fare kanvas üzerinde hareket ettiğinde tetiklenen olay dinleyicisini ekledim.
    if (isDrawing) { // Eğer çizim durumu 'true' ise.
        createParticles(e.clientX, e.clientY); // Farenin o anki konumunda parçacıklar oluşturdum.
    }
 
});
 
// Dokunmatik Ekranlar İçin Olaylar (Mobil Uyumlu)
 
canvas.addEventListener('touchstart', (e) => { // Ekrana dokunulduğunda tetiklenen olay dinleyicisini ekledim.
    e.preventDefault(); // Varsayılan dokunma davranışını (kaydırma vb.) engelledim.
    isDrawing = true; // Çizim durumunu 'true' yaptım.
    const touch = e.touches[0]; // İlk dokunmatik noktayı aldım.
    createParticles(touch.clientX, touch.clientY); // Dokunulan konumda parçacıklar oluşturdum.
}, { passive: false }); // Pasif olmayan olay dinleyicisi (preventDefault() kullanabilmek için).
 
canvas.addEventListener('touchend', (e) => { // Dokunma bittiğinde tetiklenen olay dinleyicisini ekledim.
    e.preventDefault(); // Varsayılan dokunma davranışını engelledim.
    isDrawing = false; // Çizim durumunu 'false' yaptım.
}, { passive: false }); // Pasif olmayan olay dinleyicisi.
 
canvas.addEventListener('touchcancel', (e) => { // Dokunma iptal edildiğinde (örn. başka bir uygulama açıldığında) tetiklenen olay dinleyicisini ekledim.
    e.preventDefault(); // Varsayılan dokunma davranışını engelledim.
    isDrawing = false; // Çizim durumunu 'false' yaptım.
}, { passive: false }); // Pasif olmayan olay dinleyicisi.
 
canvas.addEventListener('touchmove', (e) => { // Ekrana dokunulurken parmak hareket ettiğinde tetiklenen olay dinleyicisini ekledim.
    e.preventDefault(); // Varsayılan dokunma davranışını engelledim.
    if (isDrawing) { // Eğer çizim durumu 'true' ise.
        const touch = e.touches[0]; // İlk dokunmatik noktayı aldım.
        createParticles(touch.clientX, touch.clientY); // Dokunulan konumda parçacıklar oluşturdum.
    }
}, { passive: false }); // Pasif olmayan olay dinleyicisi.
 
// UI Kontrol Olayları (Türkçe ID'lere göre güncellendi)(Önemli!!)
 
renkSecici.addEventListener('input', (e) => { currentColor = e.target.value; }); // Renk seçici değiştiğinde rengi güncelledim.
parcacikYogunluguSlider.addEventListener('input', (e) => { currentParticleCount = parseInt(e.target.value); }); // Parçacık yoğunluğu kaydırma çubuğu değiştiğinde değeri güncelledim.
parcacikHiziSlider.addEventListener('input', (e) => { currentParticleSpeed = parseFloat(e.target.value); }); // Parçacık hızı kaydırma çubuğu değiştiğinde değeri güncelledim.
simetriSlider.addEventListener('input', (e) => { symmetryAxes = parseInt(e.target.value); }); // Simetri eksenleri kaydırma çubuğu değiştiğinde değeri güncelledim.
kaybolmaHiziSlider.addEventListener('input', (e) => { currentFadeSpeed = parseFloat(e.target.value); }); // Kaybolma hızı kaydırma çubuğu değiştiğinde değeri güncelledim.
 
temizleDugmesi.addEventListener('click', () => { // Temizle düğmesine tıklandığında tetiklenen olay dinleyicisini ekledim.
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Kanvası tamamen temizledim.
    particles = []; // Tüm parçacıkları temizledim.
});
 
kaydetDugmesi.addEventListener('click', () => { // Kaydet düğmesine tıklandığında tetiklenen olay dinleyicisini ekledim.
    const dataURL = canvas.toDataURL('image/png'); // Kanvas içeriğini bir PNG görseli olarak veri URL'sine dönüştürdüm.
    const a = document.createElement('a'); // Yeni bir 'a' (bağlantı) elementi oluşturdum.
    a.href = dataURL; // Bağlantının hedefini veri URL'si yaptım.
    a.download = 'ipek-sanati.png'; // Dosyanın indirme adını 'ipek-sanati.png' olarak belirledim.
    document.body.appendChild(a); // Bağlantı elementini belgeye ekledim.
    a.click(); // Bağlantıya tıklama olayını simüle ettim (indirme başlatmak için).
    document.body.removeChild(a); // Bağlantı elementini belgeden kaldırdım.
});
 
// Fare imlecini kontrol paneli üzerinde tutarken çizimi durdur
 
const kontrollerPaneli = document.querySelector('.kontrollerPaneli'); // 'kontrollerPaneli' sınıfına sahip elementi seçtim.
kontrollerPaneli.addEventListener('mouseenter', () => { // Fare kontrol panelinin üzerine girdiğinde tetiklenen olay dinleyicisini ekledim.
    isDrawing = false; // Çizim durumunu 'false' yaptım (kontrol panelinde çizim yapılmasını engelledim).
});