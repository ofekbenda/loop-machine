from flask import *

app = Flask(__name__, static_url_path='')


@app.route('/', methods=("POST", "GET"))
def home():
    return render_template("loopMachine.html")


if __name__ == '__main__':
    app.run(debug=True)
