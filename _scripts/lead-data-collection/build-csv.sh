

for ulcs in schools/*;
do
  for f in $ulcs/results/*.pdf;
  do
    n=${ulcs:8:4}
    java -jar tabula-0.9.1-jar-with-dependencies.jar -i "$f" | tail -n +2 > ${f%.pdf}.tmp
    gsed -i -e "s/^/$n,/" ${f%.pdf}.tmp
    cat ${f%.pdf}.tmp >> schools-2016.csv
    rm ${f%.pdf}.tmp
  done
done
