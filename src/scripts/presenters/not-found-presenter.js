export class NotFoundPresenter {
    setView(view) {
        this.view = view;
    }

    onPageLoad() {
        this.view.render();
    }
}
