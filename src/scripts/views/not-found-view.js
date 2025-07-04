export class NotFoundView {
    constructor(container) {
        this.container = container;
    }

    setPresenter(presenter) {
        this.presenter = presenter;
    }

    render() {
        this.container.innerHTML = `
            <section class="not-found-container">
                <h2>404 - Halaman Tidak Ditemukan</h2>
                <p>Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
                <a href="#/stories" class="back-home">Kembali ke Beranda</a>
            </section>
        `;
    }
}

