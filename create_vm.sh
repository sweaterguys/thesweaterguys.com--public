instance=$1

gcloud compute instances create $instance \
--image-family debian-9 \
--image-project debian-cloud \
--tags http-server,https-server \
--zone northamerica-northeast1-a \
--custom-memory 1 \
--custom-cpu 1
wait
curl -H "Authorization: token b9ea0fb030b3835a255e257990c10d0fd6339df3" -o test.sh "https://raw.githubusercontent.com/sweaterguys/stock-order/master/test.sh"
chmod +x test.sh
gcloud compute ssh $instance --zone northamerica-northeast1-a << EOF
curl -H "Authorization: token b9ea0fb030b3835a255e257990c10d0fd6339df3" -o install.sh "https://raw.githubusercontent.com/sweaterguys/stock-order/master/install.sh"
chmod +x install.sh && ./install.sh && ./start.sh
EOF