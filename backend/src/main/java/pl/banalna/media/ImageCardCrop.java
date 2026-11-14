package pl.banalna.media;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "image_card_crops")
public class ImageCardCrop {

    @Id
    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "large_zoom_percent", nullable = false)
    private int largeZoomPercent;

    @Column(name = "large_position_x", nullable = false)
    private int largePositionX;

    @Column(name = "large_position_y", nullable = false)
    private int largePositionY;

    @Column(name = "small_zoom_percent", nullable = false)
    private int smallZoomPercent;

    @Column(name = "small_position_x", nullable = false)
    private int smallPositionX;

    @Column(name = "small_position_y", nullable = false)
    private int smallPositionY;

    protected ImageCardCrop() {
    }

    public ImageCardCrop(String fileName, ImageCardCropRequest request) {
        this.fileName = fileName;
        update(request);
    }

    public void update(ImageCardCropRequest request) {
        largeZoomPercent = request.large().zoomPercent();
        largePositionX = request.large().positionX();
        largePositionY = request.large().positionY();
        smallZoomPercent = request.small().zoomPercent();
        smallPositionX = request.small().positionX();
        smallPositionY = request.small().positionY();
    }

    public ImageCardCropResponse toResponse() {
        return new ImageCardCropResponse(
                fileName,
                new CardCropSettings(largeZoomPercent, largePositionX, largePositionY),
                new CardCropSettings(smallZoomPercent, smallPositionX, smallPositionY));
    }
}
