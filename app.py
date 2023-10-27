import base64
import glob
import os
import tempfile

import numpy as np
from flask import Flask, request, redirect, send_file, render_template
from keras.models import load_model
from skimage import io
from skimage.transform import resize

app = Flask(__name__)


# load index
@app.route('/')
def main_page():
    return render_template('index.html')


# load draw page to send image for db
@app.route('/draw')
def draw_page():
    return render_template('draw.html')


# load prediction page to send image for prediction
@app.route('/prediction')
def prediction_page():
    return render_template('prediction.html')


# load image from canvas and save in folder
@app.route('/upload', methods=['POST'])
def upload():
    try:
        # check if the post request has the file part
        img_data = request.form['myImage'].replace("data:image/png;base64,", "")
        aleatorio = request.form['symbol']

        print(aleatorio)
        with tempfile.NamedTemporaryFile(delete=False, mode="w+b", suffix='.png', dir=str(aleatorio)) as fh:
            fh.write(base64.b64decode(img_data))
        print("Image uploaded")
    except Exception as err:
        print("Error occurred")
        print(err)

    return redirect("/draw", code=302)


# save images in folder for training
@app.route('/prepare', methods=['GET'])
def prepare_dataset():
    images = []
    d = ['ma', 'mb', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mi', 'mj', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq',
         'mr',
         'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi', 'bj',
         'bk', 'bl', 'bm', 'bn', 'bo', 'bp', 'bq',
         'br', 'bs', 'bt',
         'bu', 'bv', 'bw', 'bx', 'by', 'bz']
    digits = []
    for digit in d:
        filelist = glob.glob('{}/*.png'.format(digit))
        images_read = io.concatenate_images(io.imread_collection(filelist))
        images_read = images_read[:, :, :, 3]
        digits_read = np.array([digit] * images_read.shape[0])
        images.append(images_read)
        digits.append(digits_read)
    images = np.vstack(images)
    digits = np.concatenate(digits)
    np.save('X.npy', images)
    np.save('y.npy', digits)
    return "OK!"


# get images from folder for training
@app.route('/X.npy', methods=['GET'])
def download_x():
    return send_file('X.npy')


# get labels from folder for training
@app.route('/y.npy', methods=['GET'])
def download_y():
    return send_file('y.npy')


# create folders for training
def create_paths():
    digits = ['ma', 'mb', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mi', 'mj', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq',
              'mr',
              'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi',
              'bj', 'bk', 'bl', 'bm', 'bn', 'bo', 'bp', 'bq',
              'br', 'bs', 'bt',
              'bu', 'bv', 'bw', 'bx', 'by', 'bz']
    for d in digits:
        if not os.path.exists(str(d)):
            os.mkdir(str(d))


@app.route('/predict', methods=['POST'])
def prediction_model():
    model = load_model('model.keras')
    img_data = request.form['myImage'].replace("data:image/png;base64,", "")

    prediction_dir = 'prediction'
    if not os.path.exists(prediction_dir):
        os.makedirs(prediction_dir)

    with tempfile.NamedTemporaryFile(delete=False, mode="w+b", suffix='.png', dir=str('prediction')) as fh:
        fh.write(base64.b64decode(img_data))
        tmp_file_path = fh.name

    imagen = io.imread(tmp_file_path)
    imagen = imagen[:, :, 3]
    size = (128, 128)
    image = imagen / 255.0
    im = resize(image, size)
    im = im[:, :, np.newaxis]
    im = im.reshape(1, *im.shape)
    out = model.predict(im)[0]

    os.remove(tmp_file_path)

    nums = out * 100
    numeros_formateados = [f'{numero:.2f}' for numero in nums]

    symbols = ['ma', 'mb', 'mc', 'md', 'me', 'mf', 'mg', 'mh', 'mi', 'mj', 'mk', 'ml', 'mm', 'mn', 'mo', 'mp', 'mq',
               'mr',
               'ms', 'mt', 'mu', 'mv', 'mw', 'mx', 'my', 'mz', 'ba', 'bb', 'bc', 'bd', 'be', 'bf', 'bg', 'bh', 'bi',
               'bj', 'bk', 'bl', 'bm', 'bn', 'bo', 'bp', 'bq',
               'br', 'bs', 'bt',
               'bu', 'bv', 'bw', 'bx', 'by', 'bz']

    print("Image uploaded")

    return render_template('results.html', nums=numeros_formateados, symbols=symbols, img_data=img_data)


if __name__ == '__main__':
    create_paths()
    app.run()
