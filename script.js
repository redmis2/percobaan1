const GAS_ENDPOINT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
let currentStep = 1;
const totalSteps = 4;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startFormBtn').addEventListener('click', () => {
        document.getElementById('welcome-banner').classList.add('hidden');
        document.getElementById('form-container').classList.remove('hidden');
    });
    document.getElementById('nextBtn').addEventListener('click', () => { if (currentStep < totalSteps) { currentStep++; updateStepperUI(); } });
    document.getElementById('prevBtn').addEventListener('click', () => { if (currentStep > 1) { currentStep--; updateStepperUI(); } });
    document.getElementById('spmbForm').addEventListener('submit', handleFormSubmit);
});

function updateStepperUI() {
    for (let i = 1; i <= totalSteps; i++) {
        document.getElementById(`step-${i}`).classList.toggle('hidden', i !== currentStep);
    }
    document.getElementById('nextBtn').classList.toggle('hidden', currentStep === totalSteps);
    document.getElementById('submitBtn').classList.toggle('hidden', currentStep !== totalSteps);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function compressImage(file) {
    return new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width, h = img.height;
                if (w > 1200) { h = Math.round((h * 1200) / w); w = 1200; }
                canvas.width = w; canvas.height = h;
                canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    Swal.fire({ title: 'Mengirim Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    try {
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
                Alamat_Jalan: document.getElementById('Alamat_Jalan').value,
                RT_RW: document.getElementById('RT_RW').value
            },
            orangTua: {
                Ayah_Nama: document.getElementById('Ayah_Nama').value,
                Ayah_WA: document.getElementById('Ayah_WA').value,
                Ibu_Nama: document.getElementById('Ibu_Nama').value,
                Ibu_WA: document.getElementById('Ibu_WA').value
            },
            kesehatan: {
                Tinggi_Badan_CM: document.getElementById('Tinggi_Badan_CM').value,
                Berat_Badan_KG: document.getElementById('Berat_Badan_KG').value
            },
            files: {
                Akta: await compressImage(document.getElementById('file_akta').files[0]),
                KK: await compressImage(document.getElementById('file_kk').files[0])
            }
        };

        const res = await fetch(GAS_ENDPOINT_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) });
        const result = await res.json();
        Swal.close();
        if (result.status === 'success') {
            document.getElementById('form-container').classList.add('hidden');
            document.getElementById('success-container').classList.remove('hidden');
            document.getElementById('res-no-reg').innerText = result.data.noRegistrasi;
            document.getElementById('downloadPdfBtn').href = result.data.pdfUrl;
            Swal.fire('Berhasil!', 'Data tersimpan.', 'success');
        } else { throw new Error(result.message); }
    } catch (err) { Swal.fire('Gagal', err.toString(), 'error'); }
}

function switchView(view) {
    document.getElementById('public-view').classList.toggle('hidden', view === 'admin');
    document.getElementById('admin-view').classList.toggle('hidden', view !== 'admin');
    if (view === 'admin') loadAdminData();
}

async function openAdminLoginModal() {
    const { value: pass } = await Swal.fire({ title: 'Login Admin', input: 'password', showCancelButton: true });
    if (pass) {
        const res = await fetch(GAS_ENDPOINT_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: "adminLogin", password: pass }) });
        const json = await res.json();
        if (json.status === 'success') switchView('admin');
        else Swal.fire('Error', 'Password salah', 'error');
    }
}

async function loadAdminData() {
    const tbody = document.getElementById('admin-table-body');
    const res = await fetch(`${GAS_ENDPOINT_URL}?action=getRegistrations`, { method: 'GET', redirect: 'follow' });
    const json = await res.json();
    if (json.status === 'success') {
        tbody.innerHTML = json.data.map(r => `
            <tr class="border-b hover:bg-slate-50">
                <td class="p-3 font-bold text-emerald-700">${r.No_Registrasi}</td>
                <td class="p-3 font-semibold">${r.Nama_Lengkap}</td>
                <td class="p-3">${r.Ayah_WA}</td>
                <td class="p-3 text-center">
                    <button onclick="viewDetail('${r.No_Registrasi}')" class="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs"><i class="fa-solid fa-eye"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

async function viewDetail(regNo) {
    Swal.fire({ title: 'Memuat Detail...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    const res = await fetch(`${GAS_ENDPOINT_URL}?action=getDetail&noReg=${regNo}`, { method: 'GET', redirect: 'follow' });
    const json = await res.json();
    Swal.close();
    if (json.status === 'success') {
        const d = json.data;
        Swal.fire({
            title: `Detail Lengkap: ${d.Nama_Lengkap}`,
            html: `
                <div class="text-left text-xs space-y-2 max-h-96 overflow-y-auto bg-slate-50 p-4 rounded-xl border">
                    <h3 class="font-bold text-emerald-700 border-b pb-1">Data Pribadi Siswa</h3>
                    <p><b>No. Registrasi:</b> ${d.No_Registrasi}</p>
                    <p><b>Tanggal Daftar:</b> ${d.Tanggal_Daftar}</p>
                    <p><b>Nama Lengkap:</b> ${d.Nama_Lengkap}</p>
                    <p><b>Jenis Kelamin:</b> ${d.Jenis_Kelamin}</p>
                    <p><b>NIK:</b> ${d.NIK}</p>
                    <p><b>No. KK:</b> ${d.No_KK}</p>
                    <p><b>Tempat/Tgl Lahir:</b> ${d.Tempat_Lahir}, ${d.Tanggal_Lahir}</p>
                    <p><b>No. Reg Akta:</b> ${d.No_Reg_Akta}</p>
                    <p><b>Alamat:</b> ${d.Alamat_Jalan}, RT/RW ${d.RT_RW}</p>

                    <h3 class="font-bold text-emerald-700 border-b pb-1 pt-2">Data Orang Tua</h3>
                    <p><b>Nama Ayah:</b> ${d.Ayah_Nama}</p>
                    <p><b>No. WA Ayah:</b> ${d.Ayah_WA}</p>
                    <p><b>Nama Ibu:</b> ${d.Ibu_Nama}</p>
                    <p><b>No. WA Ibu:</b> ${d.Ibu_WA}</p>

                    <h3 class="font-bold text-emerald-700 border-b pb-1 pt-2">Data Kesehatan</h3>
                    <p><b>Tinggi Badan:</b> ${d.Tinggi_Badan_CM} cm</p>
                    <p><b>Berat Badan:</b> ${d.Berat_Badan_KG} kg</p>

                    <h3 class="font-bold text-emerald-700 border-b pb-1 pt-2">Berkas & Dokumen</h3>
                    <div class="flex flex-wrap gap-2 pt-1">
                        <a href="${d.Url_Akta}" target="_blank" class="px-3 py-1 bg-slate-200 rounded font-bold">Akta</a>
                        <a href="${d.Url_KK}" target="_blank" class="px-3 py-1 bg-slate-200 rounded font-bold">KK</a>
                        <a href="${d.Url_PDF_Bukti}" target="_blank" class="px-3 py-1 bg-emerald-600 text-white rounded font-bold">Kartu PDF</a>
                    </div>
                </div>
            `,
            width: '650px',
            confirmButtonText: 'Tutup'
        });
    }
}
