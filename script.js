// CONFIGURATION: Ganti Web App URL di bawah dengan URL Deploy Apps Script Anda
const GAS_ENDPOINT_URL = 'https://script.google.com/macros/s/AKfycbyHvIkLalQxk7fLkX2a7-xXU7_SCJqZao7IPhMMEfjuoJ238RXtYEeRGvVhlS-ckMA/exec';

let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
    initFormLogic();
});

function initFormLogic() {
    document.getElementById('startFormBtn').addEventListener('click', () => {
        document.getElementById('welcome-banner').classList.add('hidden');
        document.getElementById('form-container').classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('info-saudara').addEventListener('click', () => {
        Swal.fire({
            title: 'Informasi Jumlah Saudara Kandung',
            text: 'Jumlah saudara kandung dihitung tanpa menyertakan peserta didik (kakak + adik). Isikan 0 apabila anak tunggal.',
            icon: 'info',
            confirmButtonText: 'Mengerti'
        });
    });

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

    document.getElementById('Has_Wali').addEventListener('change', (e) => {
        const waliCard = document.getElementById('wali-card');
        if (e.target.checked) waliCard.classList.remove('hidden');
        else waliCard.classList.add('hidden');
    });

    document.getElementById('Ada_PAUD').addEventListener('change', (e) => {
        const paudDetails = document.getElementById('paud-details');
        if (e.target.value === 'Ya') paudDetails.classList.remove('hidden');
        else paudDetails.classList.add('hidden');
    });

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

    document.querySelectorAll('.step-indicator').forEach((ind) => {
        ind.addEventListener('click', () => {
            currentStep = parseInt(ind.getAttribute('data-step'));
            updateStepperUI();
        });
    });

    document.getElementById('spmbForm').addEventListener('submit', handleFormSubmit);
}

function updateStepperUI() {
    for (let i = 1; i <= totalSteps; i++) {
        const stepEl = document.getElementById(`step-${i}`);
        if (i === currentStep) stepEl.classList.remove('hidden');
        else stepEl.classList.add('hidden');
    }

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

    document.querySelectorAll('.step-indicator').forEach((ind) => {
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

    document.getElementById('progress-line').style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateAllFields() {
    const form = document.getElementById('spmbForm');
    const requiredInputs = form.querySelectorAll('[required]');
    
    for (let input of requiredInputs) {
        if (!input.value.trim()) {
            const stepParent = input.closest('.step-content');
            if (stepParent) {
                currentStep = parseInt(stepParent.id.replace('step-', ''));
                updateStepperUI();
            }
            input.focus();
            Swal.fire('Form Belum Lengkap', 'Mohon lengkapi seluruh kolom wajib bertanda (*).', 'warning');
            return false;
        }
    }

    const nik = document.getElementById('NIK').value.trim();
    const kk = document.getElementById('No_KK').value.trim();
    if (nik.length !== 16 || isNaN(nik)) {
        currentStep = 1; updateStepperUI();
        Swal.fire('Validasi Gagal', 'NIK Siswa harus berjumlah 16 digit angka.', 'warning');
        return false;
    }
    if (kk.length !== 16 || isNaN(kk)) {
        currentStep = 1; updateStepperUI();
        Swal.fire('Validasi Gagal', 'Nomor KK harus berjumlah 16 digit angka.', 'warning');
        return false;
    }

    return true;
}

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
                resolve(canvas.toDataURL('image/jpeg', quality));
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
        html: 'Mohon tunggu, berkas sedang dikompresi dan dibuatkan folder pribadi di server.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
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
                Wali_WA: document.getElementById('Wali_WA').value || "-"
            },
            kesehatan: {
                Ada_PAUD: document.getElementById('Ada_PAUD').value,
                PAUD_NamaSekolah: document.getElementById('PAUD_NamaSekolah').value || "-",
                PAUD_ThnLulus: document.getElementById('PAUD_ThnLulus').value || "-",
                PAUD_KepalaSekolah: document.getElementById('PAUD_KepalaSekolah').value || "-",
                Golongan_Darah: document.getElementById('Golongan_Darah').value,
                Tinggi_Badan_CM: document.getElementById('Tinggi_Badan_CM').value,
                Berat_Badan_KG: document.getElementById('Berat_Badan_KG').value,
                Riwayat_Penyakit: document.getElementById('Riwayat_Penyakit').value || "Tidak Ada",
                Alergi: document.getElementById('Alergi').value || "Tidak Ada"
            },
            files: { Akta: aktaBase64, KK: kkBase64, Ijazah: ijazahBase64, Foto: fotoBase64 }
        };

        const response = await fetch(GAS_ENDPOINT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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

// ADMIN DASHBOARD FUNCTIONS
function switchView(view) {
    if (view === 'admin') {
        document.getElementById('public-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
        loadAdminData();
    } else {
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('public-view').classList.remove('hidden');
    }
}

async function openAdminLoginModal() {
    const { value: password } = await Swal.fire({
        title: 'Login Admin',
        input: 'password',
        inputPlaceholder: 'Masukkan password admin',
        inputAttributes: { autocapitalize: 'off' },
        showCancelButton: true,
        confirmButtonText: 'Masuk',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#059669'
    });

    if (password) {
        Swal.fire({ title: 'Memverifikasi...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
        try {
            const response = await fetch(GAS_ENDPOINT_URL, {
                method: 'POST',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: "adminLogin", password: password })
            });
            const result = await response.json();
            Swal.close();
            if (result.status === 'success') {
                switchView('admin');
            } else {
                Swal.fire('Akses Ditolak', 'Password admin salah.', 'error');
            }
        } catch (err) {
            Swal.fire('Gagal', err.toString(), 'error');
        }
    }
}

async function loadAdminData() {
    const tbody = document.getElementById('admin-table-body');
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Memuat data pendaftar...</td></tr>`;
    try {
        const response = await fetch(`${GAS_ENDPOINT_URL}?action=getRegistrations`, { method: 'GET', redirect: 'follow' });
        const result = await response.json();
        if (result.status === 'success') {
            const data = result.data;
            document.getElementById('stat-total').innerText = data.length;
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Belum ada data pendaftar.</td></tr>`;
                return;
            }
            tbody.innerHTML = data.map(row => `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-3 font-bold text-emerald-700">${row.No_Registrasi}</td>
                    <td class="p-3">${row.Tanggal_Daftar}</td>
                    <td class="p-3 font-semibold">${row.Nama_Lengkap}</td>
                    <td class="p-3">${row.Jenis_Kelamin}</td>
                    <td class="p-3">${row.Ayah_WA || '-'}</td>
                    <td class="p-3 text-center flex justify-center gap-2">
                        <button onclick="viewDetail('${row.No_Registrasi}')" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"><i class="fa-solid fa-eye"></i></button>
                        <a href="${row.Url_PDF_Bukti}" target="_blank" class="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600"><i class="fa-solid fa-file-pdf"></i></a>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-red-500">Gagal memuat data dari server.</td></tr>`;
    }
}

async function viewDetail(regNo) {
    Swal.fire({ title: 'Memuat Detail...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
        const response = await fetch(`${GAS_ENDPOINT_URL}?action=getDetail&noReg=${regNo}`, { method: 'GET', redirect: 'follow' });
        const result = await response.json();
        Swal.close();
        if (result.status === 'success') {
            const d = result.data;
            Swal.fire({
                title: `Detail Siswa: ${d.Nama_Lengkap}`,
                html: `
                    <div class="text-left text-xs space-y-2 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-xl border">
                        <p><b>No. Registrasi:</b> ${d.No_Registrasi}</p>
                        <p><b>NIK:</b> ${d.NIK}</p>
                        <p><b>No. KK:</b> ${d.No_KK}</p>
                        <p><b>Tempat/Tgl Lahir:</b> ${d.Tempat_Lahir}, ${d.Tanggal_Lahir}</p>
                        <p><b>Alamat:</b> ${d.Alamat_Jalan}, RT/RW ${d.RT_RW}, ${d.Kelurahan}, ${d.Kecamatan}</p>
                        <p><b>Ayah:</b> ${d.Ayah_Nama} (${d.Ayah_WA})</p>
                        <p><b>Ibu:</b> ${d.Ibu_Nama} (${d.Ibu_WA})</p>
                        <hr class="my-2">
                        <div class="flex flex-wrap gap-2 pt-2">
                            <a href="${d.Url_Akta}" target="_blank" class="px-3 py-1 bg-slate-200 rounded font-bold text-slate-700">Akta</a>
                            <a href="${d.Url_KK}" target="_blank" class="px-3 py-1 bg-slate-200 rounded font-bold text-slate-700">KK</a>
                            <a href="${d.Url_Foto}" target="_blank" class="px-3 py-1 bg-slate-200 rounded font-bold text-slate-700">Foto</a>
                            <a href="${d.Url_PDF_Bukti}" target="_blank" class="px-3 py-1 bg-emerald-600 text-white rounded font-bold">Kartu PDF</a>
                        </div>
                    </div>
                `,
                width: '600px',
                confirmButtonText: 'Tutup'
            });
        }
    } catch (err) {
        Swal.fire('Error', 'Gagal memuat detail siswa.', 'error');
    }
}
