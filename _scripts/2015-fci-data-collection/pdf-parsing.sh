#java -jar ~/dev/healthy-school-buildings/_scripts/lead-data-collection/tabula-0.9.1-jar-with-dependencies.jar ~/Desktop/2015/1010.pdf --area 378,31,685,576

for pdf in *.pdf;
do
  echo "${pdf%.pdf}
$(java -jar ~/dev/healthy-school-buildings/_scripts/lead-data-collection/tabula-0.9.1-jar-with-dependencies.jar "$pdf" --area 378,31,685,576 -i)" > text/${pdf%.pdf}.txt
done
