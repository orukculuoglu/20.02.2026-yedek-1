# MockServer 3001 Başlatma Rehberi

## ⚡ HIZLI BAŞLAT (Tercih edilen yöntem)

### Adım 1: PowerShell/Terminal Aç
```powershell
cd "C:\Users\CASPER\Desktop\Lent+\Lent+ Kullanıcı Ekranı ve Detayları\aı studıo\Bakım Merkezi\admin-paneli-autodata-safecore ( Bakım Merkezi - Dashboard ekranı Güncelleme )"
```

### Adım 2: Mock Server Başlat
```powershell
npm run dev:mock-server
```

**Beklenen Output:**
```
⚡ Mock Server running on http://localhost:3001

Available endpoints:
   GET  /api/oem/catalog?brand=BMW&query=...
   POST /api/oem/ingest
   GET  /api/part-master/catalog
   GET  /api/suppliers
```

---

## 🔄 Alternatif Yöntemler

### Yöntem 1: npm scripti
```powershell
npm run dev:mock-server
```

### Yöntem 2: Doğrudan Node
```powershell
node start-mock-server.js
```

### Yöntem 3: İki Terminal Aç (Parallel)
```powershell
# Terminal 1: Frontend
npm run dev

# Terminal 2: Mock Server
npm run dev:mock-server
```

---

## 🧪 Test Et (başlattıktan sonra)

### Yeni Terminal / PowerShell açıp test et:

```powershell
# Test 1: OEM Catalog Ara
curl "http://localhost:3001/api/oem/catalog?brand=BMW"

# Test 2: OEM Parçası İngest Et
$body = @{
  items = @(
    @{
      oem_brand = "BMW"
      oem_part_number = "34 11 6 789 123"
      part_name = "Brake Pad"
      category = "BRAKE_SYSTEM"
      last_updated = "2025-02-01T00:00:00.000Z"
      source = "API"
    }
  )
} | ConvertTo-Json -Depth 10

curl -X POST "http://localhost:3001/api/oem/ingest" `
  -H "Content-Type: application/json" `
  -Body $body

# Test 3: Canonical Parts
curl "http://localhost:3001/api/part-master/catalog"

# Test 4: Suppliers
curl "http://localhost:3001/api/suppliers"
```

**Beklenen Yanıt:**
```json
{
  "success": true,
  "items": [
    {
      "id": "CAT-BMW-001",
      "oem_brand": "BMW",
      "oem_part_number": "34 11 6 789 123",
      "part_name": "Brake Pad Front Left",
      ...
    }
  ]
}
```

---

## 🐛 Sorun Giderme

### ❌ "Port 3001 already in use"
```powershell
# Windows: Port'u kullanıyor kim bul
netstat -ano | findstr :3001

# Sonuç örneği:
# TCP    127.0.0.1:3001         0.0.0.0:0              LISTENING       12345

# O process'i kapat (PID = 12345)
taskkill /PID 12345 /F

# Veya farklı port kullan
set PORT=3002
npm run dev:mock-server
```

### ❌ "Cannot find module..."
```powershell
# Node.js yüklü mü kontrol et
node --version

# npm yüklü mü kontrol et
npm --version

# Beklenen: v18+ ve npm 8+
```

### ❌ "No such file or directory"
```powershell
# Doğru directory'de misin kontrol et
pwd

# Sonuç: C:\Users\CASPER\Desktop\... olmalı

# start-mock-server.js dosyası var mı?
ls start-mock-server.js
# Beklenen: ✅ Found
```

### ❌ "Connection refused"
```powershell
# Mock server çalışıyor mu kontrol et
# Başka bir terminal'de:

# Test yet
curl "http://localhost:3001/api/suppliers" -v

# -v = verbose mode (detaylı output)
# Eğer "Connection refused" = server çalışmıyor

# Tekrar başlat:
npm run dev:mock-server
```

---

## 📋 Checklist

```
[ ] Terminal'de: pwd → Doğru folder mu?
[ ] Node.js yüklü? → node --version
[ ] npm yüklü? → npm --version
[ ] start-mock-server.js mevcut? → ls start-mock-server.js
[ ] Komutu çalıştır: npm run dev:mock-server
[ ] Output "Mock Server running" gösteriyor mu?
[ ] Başka terminal'de test: curl "http://localhost:3001/api/suppliers"
[ ] 200 OK + JSON cevabı geliyor mu?
```

✅ **Tümü green ise, hazırsın!**

---

## 💡 İpuçları

1. **Two Terminal Setup** (Tavsiye)
   - Terminal 1: `npm run dev:mock-server` (port 3001)
   - Terminal 2: `npm run dev` (port 3003 - Vite)
   - Her ikisi de ayakta kalıyor

2. **Live Reload**
   - Mock server otomatik reload **YAPMAZ**
   - Değişiklik sonrası tekrar başlat (Ctrl+C sonra npm run dev:mock-server)
   
3. **Browser Test**
   - http://localhost:3001/api/suppliers doğrudan browser'da test et
   - JSON görüyorsan server çalışıyor

4. **Firewall**
   - Eğer hala "connection refused":
   - Windows Defender Firewall'da Node.js izni ver
   - Settings → Firewall → Allow app → Add Node.js

---

## 📞 Hala Sorun?

```powershell
# Debug mode'da başlat
$env:DEBUG = 'true'
npm run dev:mock-server

# Veya doğrudan
node start-mock-server.js --debug
```

**En son çare: Visual Studio Code'da açıp F5 ile debug et**
