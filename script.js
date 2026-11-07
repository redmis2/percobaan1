// CONFIGURATION: Ganti Web App URL di bawah dengan URL Deploy Apps Script Anda
const GAS_ENDPOINT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';

let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
    initFormLogic();
});

function initFormLogic() {
    // Start Form from Welcome Banner
    document.getElementById('startFormBtn').addEventListener('click', () => {
        document.getElementById('welcome-banner').classList.add('hidden');
        document.getElementById('form-container').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Info Saudara Kandung Tooltip
    document.getElementById('info-saudara').addEventListener('click', () => {
        Swal.fire({
            title: 'Informasi Jumlah Saudara Kandung',
            text: 'Jumlah saudara kandung yang dimiliki peserta didik. Jumlah saudara kandung dihitung tanpa menyertakan peserta didik, dengan rumus jumlah kakak ditambah jumlah adik. Isikan 0 apabila anak tunggal.',
            icon: 'info',
            confirmButtonText: 'Mengerti'
        });
    });

    // Dynamic Select Toggle Hobi & Cita
    document.getElementById('Hobi_Select').addEventListener('change', (e) => {
        const input = document.getElementById('Hobi_Lainnya');
        if (e.target.value === 'lainnya') input.classList.remove('hidden');
        else input.classList.add('hidden');
    });

    document.getElementById('Cita_Select').addEventListener('change', (e) => {
        const input = document.getElementById('Cita_Lainnya');
        if (e.target.value === 'lainnya') input.classList.remove('hidden');
        else input.classList.add('hidden');
    });

    // Toggle Wali Card
    document.getElementById('Has_Wali').addEventListener('change', (e) => {
        const waliCard = document.getElementById('wali-card');
        if (e.target.checked) waliCard.classList.remove('hidden');
        else waliCard.classList.add('hidden');
    });

    // Toggle PAUD Details
    document.getElementById('Ada_PAUD').addEventListener('change', (e) => {
        const paudDetails = document.getElementById('paud-details');
        if (e.target.value === 'Ya') paudDetails.classList.remove('hidden');
        else paudDetails.classList.add('hidden');
    });

    // Stepper Navigation Buttons (Bebas berpindah halaman tanpa blokir validasi saat navigasi bolak-balik)
    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentStep < totalSteps) {
            currentStep++;
            updateStepperUI();
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStepperUI();
        }
    });

    // Direct Stepper Indicator Click (Bebas berpindah halaman)
    document.querySelectorAll('.step-indicator').forEach((ind) => {
        ind.addEventListener('click', () => {
            const targetStep = parseInt(ind.getAttribute('data-step'));
            currentStep = targetStep;
            updateStepperUI();
        });
    });

    // Form Submission
    document.getElementById('spmbForm').addEventListener('submit', handleFormSubmit);
}

function updateStepperUI() {
    // Show/Hide Steps
    for (let i = 1; i <= totalSteps; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (i === currentStep) stepEl.classList.remove('hidden');
        else stepEl.classList.add('hidden');
    }

    // Buttons Visibility
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');

    if (currentStep === 1) prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
    else prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }

    // Step Circles UI
    const stepIndicators = document.querySelectorAll('.step-indicator');
    stepIndicators.forEach((ind) => {
        const stepNum = parseInt(ind.getAttribute('data-step'));
        const circle = ind.querySelector('.step-circle');
        const label = ind.querySelector('span');

        if (stepNum < currentStep) {
            circle.className = 'step-circle w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow';
            circle.innerHTML = '<i class="fa-solid fa-check"></i>';
            label.className = 'text-xs font-semibold mt-2 text-emerald-700';
        } else if (stepNum === currentStep) {
            circle.className = 'step-circle w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shadow ring-4 ring-emerald-100';
            circle.innerText = stepNum;
            label.className = 'text-xs font-semibold mt-2 text-emerald-700 font-bold';
        } else {
            circle.className = 'step-circle w-10 h-10 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center font-bold shadow';
            circle.innerText = stepNum;
            label.className = 'text-xs font-semibold mt-2 text-slate-500';
        }
    });

    // Progress Line Width
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-line').style.width = `${progressPercent}%`;

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAllFields() {
    const form = document.getElementById('spmbForm');
    const requiredInputs = form.querySelectorAll('[required]');
    
    for (let input of requiredInputs) {
        if (!input.value.trim()) {
            const stepParent = input.closest('.step-content');
            if (stepParent) {
                const stepId = stepParent.id;
                currentStep = parseInt(stepId.replace('step-', ''));
                updateStepperUI();
            }
            input.focus();
            input.classList.add('border-red-500', 'ring-2', 'ring-red-200');
            Swal.fire('Form Belum Lengkap', 'Mohon lengkapi seluruh kolom wajib bertanda (*). Periksa kembali isian formulir Anda.', 'warning');
            return false;
        } else {
            input.classList.remove('border-red-500', 'ring-2', 'ring-red-200');
        }
    }

    // Validasi khusus NIK & KK
    const nik = document.getElementById('NIK').value.trim();
    const kk = document.getElementById('No_KK').value.trim();
    if (nik.length !== 16 || isNaN(nik)) {
        currentStep = 1; updateStepperUI();
        document.getElementById('NIK').focus();
        Swal.fire('Validasi Gagal', 'NIK Siswa harus berjumlah 16 digit angka.', 'warning');
        return false;
    }
    if (kk.length !== 16 || isNaN(kk)) {
        currentStep = 1; updateStepperUI();
        document.getElementById('No_KK').focus();
        Swal.fire('Validasi Gagal', 'Nomor KK harus berjumlah 16 digit angka.', 'warning');
        return false;
    }

    return true;
}

// Client-Side Canvas Image Compression
function compressImage(file, maxWidth = 1200, quality = 0.8) {
    return new Promise((resolve, reject) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
        };
        reader.onerror = (error) => reject(error);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (!validateAllFields()) return;

    Swal.fire({
        title: 'Mengirim Data Pendaftaran...',
        html: 'Mohon tunggu, berkas sedang dikompresi dan dikirim ke server backend.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        const aktaBase64 = await compressImage(document.getElementById('file_akta').files[0]);
        const kkBase64 = await compressImage(document.getElementById('file_kk').files[0]);
        const ijazahBase64 = await compressImage(document.getElementById('file_ijazah').files[0]);
        const fotoBase64 = await compressImage(document.getElementById('file_foto').files[0]);

        const hobiVal = document.getElementById('Hobi_Select').value === 'lainnya' ? document.getElementById('Hobi_Lainnya').value : document.getElementById('Hobi_Select').value;
        const citaVal = document.getElementById('Cita_Select').value === 'lainnya' ? document.getElementById('Cita_Lainnya').value : document.getElementById('Cita_Select').value;

        const payload = {
            action: "submitRegistration",
            siswa: {
                Nama_Lengkap: document.getElementById('Nama_Lengkap').value,
                Jenis_Kelamin: document.querySelector('input[name="Jenis_Kelamin"]:checked').value,
                NIK: document.getElementById('NIK').value,
                No_KK: document.getElementById('No_KK').value,
                Tempat_Lahir: document.getElementById('Tempat_Lahir').value,
                Tanggal_Lahir: document.getElementById('Tanggal_Lahir').value,
                No_Reg_Akta: document.getElementById('No_Reg_Akta').value,
                Hobi: hobiVal,
                Cita_Cita: citaVal,
                Berkebutuhan_Khusus: document.getElementById('Berkebutuhan_Khusus').value,
                Alamat_Jalan: document.getElementById('Alamat_Jalan').value,
                RT_RW: document.getElementById('RT_RW').value,
                Kelurahan: document.getElementById('Kelurahan').value,
                Kecamatan: document.getElementById('Kecamatan').value,
                Jarak_Rumah_Ke_Sekolah: document.getElementById('Jarak_KM').value + " " + document.getElementById('Satuan_Jarak').value,
                Waktu_Tempuh_Ke_Sekolah: document.getElementById('Waktu_Tempuh_Menit').value + " Menit",
                Tempat_Tinggal: document.getElementById('Tempat_Tinggal').value,
                Transportasi: document.getElementById('Transportasi').value,
                Anak_Ke: document.getElementById('Anak_Ke').value,
                Jumlah_Saudara_Kandung: document.getElementById('Jumlah_Saudara').value
            },
            orangTua: {
                Ayah_Nama: document.getElementById('Ayah_Nama').value,
                Ayah_NIK: document.getElementById('Ayah_NIK').value,
                Ayah_WA: document.getElementById('Ayah_WA').value,
                Ayah_ThnLahir: document.getElementById('Ayah_ThnLahir').value,
                Ayah_Pendidikan: document.getElementById('Ayah_Pendidikan').value,
                Ayah_Pekerjaan: document.getElementById('Ayah_Pekerjaan').value,
                Ayah_Penghasilan: document.getElementById('Ayah_Penghasilan').value,
                Ayah_KebutuhanKhusus: document.getElementById('Ayah_KebutuhanKhusus').value,
                Ibu_Nama: document.getElementById('Ibu_Nama').value,
                Ibu_NIK: document.getElementById('Ibu_NIK').value,
                Ibu_WA: document.getElementById('Ibu_WA').value,
                Ibu_ThnLahir: document.getElementById('Ibu_ThnLahir').value,
                Ibu_Pendidikan: document.getElementById('Ibu_Pendidikan').value,
                Ibu_Pekerjaan: document.getElementById('Ibu_Pekerjaan').value,
                Ibu_Penghasilan: document.getElementById('Ibu_Penghasilan').value,
                Ibu_KebutuhanKhusus: document.getElementById('Ibu_KebutuhanKhusus').value,
                Has_Wali: document.getElementById('Has_Wali').checked ? "Ya" : "Tidak",
                Wali_Nama: document.getElementById('Wali_Nama').value || "-",
                Wali_NIK: document.getElementById('Wali_NIK').value || "-",
                Wali_WA: document.getElementById('Wali_WA').value || "-",
                Wali_ThnLahir: document.getElementById('Wali_ThnLahir').value || "-",
                Wali_Pendidikan: document.getElementById('Wali_Pendidikan').value || "-",
                Wali_Pekerjaan: document.getElementById('Wali_Pekerjaan').value || "-",
                Wali_Penghasilan: document.getElementById('Wali_Penghasilan').value || "-",
                Wali_KebutuhanKhusus: document.getElementById('Wali_KebutuhanKhusus').value || "-"
            },
            kesehatan: {
                Ada_PAUD: document.getElementById('Ada_PAUD').value,
                PAUD_NamaSekolah: document.getElementById('PAUD_NamaSekolah').value || "-",
                PAUD_ThnLulus: document.getElementById('PAUD_ThnLulus').value || "-",
                PAUD_KepalaSekolah: document.getElementById('PAUD_KepalaSekolah').value || "-",
                PAUD_Kecamatan: document.getElementById('PAUD_Kecamatan').value || "-",
                PAUD_KabKota: document.getElementById('PAUD_KabKota').value || "-",
                PAUD_Provinsi: document.getElementById('PAUD_Provinsi').value || "-",
                Golongan_Darah: document.getElementById('Golongan_Darah').value,
                Tinggi_Badan_CM: document.getElementById('Tinggi_Badan_CM').value,
                Berat_Badan_KG: document.getElementById('Berat_Badan_KG').value,
                Riwayat_Penyakit: document.getElementById('Riwayat_Penyakit').value || "Tidak Ada",
                Obat_Dikonsumsi: document.getElementById('Obat_Dikonsumsi').value || "Tidak Ada",
                Alergi: document.getElementById('Alergi').value || "Tidak Ada",
                Dokter_Nama_NoTelp: document.getElementById('Dokter_Nama_NoTelp').value || "Tidak Ada"
            },
            files: {
                Akta: aktaBase64,
                KK: kkBase64,
                Ijazah: ijazahBase64,
                Foto: fotoBase64
            }
        };

        const response = await fetch(GAS_ENDPOINT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
            Swal.close();
            document.getElementById('form-container').classList.add('hidden');
            document.getElementById('success-container').classList.remove('hidden');
            
            document.getElementById('res-no-reg').innerText = result.data.noRegistrasi;
            document.getElementById('downloadPdfBtn').href = result.data.pdfUrl;

            Swal.fire('Berhasil!', 'Pendaftaran Anda berhasil tersimpan.', 'success');
        } else {
            throw new Error(result.message || 'Terjadi kesalahan sistem.');
        }

    } catch (err) {
        Swal.fire('Gagal Mengirim', err.message, 'error');
    }
}
