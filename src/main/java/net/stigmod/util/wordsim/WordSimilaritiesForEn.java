/*
 * Copyright 2014-2016, Stigmergic-Modeling Project
 * SEIDR, Peking University
 * All rights reserved
 *
 * Stigmergic-Modeling is used for collaborative groups to create a conceptual model.
 * It is based on UML 2.0 class diagram specifications and stigmergy theory.
 */

package net.stigmod.util.wordsim;

import edu.sussex.nlp.jws.JWS;
import edu.sussex.nlp.jws.Path;
import edu.sussex.nlp.jws.WuAndPalmer;
import net.didion.jwnl.JWNL;
import net.didion.jwnl.JWNLException;
import net.didion.jwnl.data.IndexWord;
import net.didion.jwnl.data.POS;
import net.didion.jwnl.dictionary.Dictionary;
import net.didion.jwnl.dictionary.MorphologicalProcessor;
import net.stigmod.domain.conceptualmodel.ValueNode;
import net.stigmod.util.config.Config;
import net.stigmod.util.config.ConfigLoader;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * @author Kai Fu
 * @version 2016/3/13
 */
public class WordSimilaritiesForEn {

    public static List<List<Double>> vNodeSimList = new ArrayList<>();
    public static WuAndPalmer wup;
    public static edu.sussex.nlp.jws.Path pathLength;

    private static MorphologicalProcessor morph;

    public static void initWuAndPalmer_PathLength() {
        Config config = ConfigLoader.load();
        String path = config.getWordNetPath();
        JWS ws = new JWS(path, "3.0");

        wup = ws.getWuAndPalmer();
        pathLength = ws.getPath();

        //初始化jwnl接口,将word与java直接连接起来
        URL jwnlUrl = Thread.currentThread().getContextClassLoader().getResource("/file_properties.xml");
        assert jwnlUrl != null;
        File file = new File(jwnlUrl.getFile());
        try {
            JWNL.initialize(new FileInputStream(file));
            morph= Dictionary.getInstance().getMorphologicalProcessor();
        } catch (JWNLException e) {
            e.printStackTrace();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
        }
    }

    public static void getVNodeSimListByName(List<ValueNode> valueNodeList) {

        int vSize = valueNodeList.size();
        List<List<String>> nameList = new ArrayList<>();
        for(int i=0;i<vSize;i++) {
            String fullName = valueNodeList.get(i).getName();
            List<String> subNameList = new ArrayList<>();
            int start=0,nameLen=fullName.length();
            for(int j=0;j<nameLen;j++) {
                char ch = fullName.charAt(j);
                if((ch>='A'&&ch<='Z'&&j!=0)||j==nameLen-1) {
                    if(j==nameLen-1) j++;
                    subNameList.add(convertToValidFormat(fullName.substring(start, j)));
                    start=j;
                }
            }
            nameList.add(subNameList);
        }

        for(int i=0;i<vSize;i++) {
            List<Double> simList = new ArrayList<>();
            for(int j=0;j<vSize;j++) {
                if(i==j) simList.add(1.0);
                else {
                    List<String> sourceNameList = nameList.get(i);
//                    if(isBasicType(sourceNameList)) {
//                        simList.add(0.0);
//                        continue;
//                    }
                    List<String> targetNameList = nameList.get(j);
//                    if(isBasicType(targetNameList)) {
//                        simList.add(0.0);
//                        continue;
//                    }
//                    if(targetNameList.toString().equals("string")||) {
//                        System.out.println("find it!");
//                    }
//                    System.out.println(sourceNameList.toString()+" , "+targetNameList.toString());
                    if (sourceNameList.toString().equals(targetNameList.toString())) simList.add(1.0);
                    else simList.add(getMaxSimForNameList(sourceNameList,targetNameList));
                }
            }
            vNodeSimList.add(simList);
        }
    }

//    private static boolean isBasicType(List<String> nameList) {
//        String name = nameList.toString();
//        if(name.equals("[boolean]")||name.equals("[float]")||name.equals("[int]")||name.equals("[string]")||name.equals("[true]")) return true;
//        else return false;
//    }

    private static Double getMaxSimForNameList(List<String> sourceNameList,List<String> targetNameList) {
        double maxSim = 0.0;
        try {
            StringBuffer sourceFullNameWithBlank = new StringBuffer();
            StringBuffer targetFullNameWithBlank = new StringBuffer();
            int sourceSize = sourceNameList.size();
            int targetSize = targetNameList.size();
            for(int i=0;i<sourceSize;i++) {
                sourceFullNameWithBlank.append(sourceNameList.get(i).toLowerCase());
                if(i!=sourceSize-1) sourceFullNameWithBlank.append(" ");
            }
            for(int i=0;i<targetSize;i++) {
                targetFullNameWithBlank.append(targetNameList.get(i).toLowerCase());
                if(i!=targetSize-1) targetFullNameWithBlank.append(" ");
            }
            //如果两个名字相同,则为1.0
            if(sourceFullNameWithBlank.toString().equals(targetFullNameWithBlank.toString())) maxSim = 1.0;
            else {
                if((sourceSize>0&&('A'<=sourceNameList.get(0).charAt(0)&&sourceNameList.get(0).charAt(0)<='Z')) ||
                        targetSize>0&&('A'<=targetNameList.get(0).charAt(0)&&targetNameList.get(0).charAt(0)<='Z'))
                    maxSim = wup.max(sourceFullNameWithBlank.toString(), targetFullNameWithBlank.toString(), "n");
                else {
                    double sim1 = wup.max(sourceFullNameWithBlank.toString(),targetFullNameWithBlank.toString(), "n");
                    double sim2 = wup.wup(sourceFullNameWithBlank.toString(),1,targetFullNameWithBlank.toString(),1,"v");
//                    maxSim = Double.max(sim1,sim2);
                    maxSim = Math.max(sim1, sim2);
                }
            }
            if(Math.abs(maxSim-0.0)<0.00001 && (sourceSize>1 || targetSize>1)) {
                boolean isSourceClass = false;
                boolean isTargetClass = false;
                if(sourceNameList.size()==0||targetNameList.size()==0) maxSim = 0.0;
                else if(sourceNameList.get(0).equals("")&&targetNameList.get(0).equals("")) maxSim = 1.0;
                else if(sourceNameList.get(0).equals("")||targetNameList.get(0).equals("")) maxSim = 0.0;
                else {
                    if('A'<=sourceNameList.get(0).charAt(0) && sourceNameList.get(0).charAt(0)<='Z') isSourceClass = true;
                    if('A'<=targetNameList.get(0).charAt(0) && targetNameList.get(0).charAt(0)<='Z') isTargetClass = true;
                    if(isSourceClass || isTargetClass) {
                        List<NameSimilarity> nameSimList = new ArrayList<>();
                        int maxSize = Math.max(sourceSize, targetSize);//获取最大长度
                        int minSize = Math.min(sourceSize,targetSize);//获取最小长度
                        for(String sourceName : sourceNameList) {
                            sourceName = sourceName.toLowerCase();
                            for(String targetName : targetNameList) {
                                targetName = targetName.toLowerCase();
                                //                        double sim=wup.max(sourceName,targetName,"n");
                                double sim = 0.0;
                                if(sourceName.equals(targetName)) sim = 1.0;
                                else {
                                    double sim1 = wup.max(sourceName,targetName,"n");
                                    sim = sim1;
                                }
                                //                        else sim = wup.wup(sourceName,1,targetName,1,"n");
                                NameSimilarity nameSimilarity = new NameSimilarity(sourceName,targetName,sim);
                                nameSimList.add(nameSimilarity);
                            }
                        }
                        Collections.sort(nameSimList, new Comparator<NameSimilarity>() {
                            @Override
                            public int compare(NameSimilarity o1, NameSimilarity o2) {
                                return Double.compare(o2.similarity,o1.similarity)  ;
                            }
                        });
                        //nameSimList中的数据被排序了,由大到小
                        int curSize = 0 , index = 0;//直到curSize等于minSize才行
                        List<String> dupNameList = new ArrayList<>();//用来防止重复的name出现
                        double targetSim = 0.0;
                        while(curSize<minSize) {
                            if(!dupNameList.contains(nameSimList.get(index).sourceName) &&
                                    !dupNameList.contains(nameSimList.get(index).targetName)) {
                                targetSim += nameSimList.get(index).similarity;
                                dupNameList.add(nameSimList.get(index).sourceName);
                                dupNameList.add(nameSimList.get(index).targetName);
                                curSize++;
                            }
                            index++;
                        }
                        maxSim = targetSim/maxSize;//这个地方要除以最大的那个数
                    }else {//两个都表示属性
                        int minSize = Math.min(sourceSize,targetSize);
                        double masterSim = 0.0;
                        int conSize = 1 ;
                        for(int i=0;i<minSize;i++) {
                            String curSourceName = sourceNameList.get(sourceSize-1-i).toLowerCase();
                            String curTargetName = targetNameList.get(targetSize-1-i).toLowerCase();

                            if(i==0) {
                                if(curSourceName.equals(curTargetName)) masterSim=1.0;
                                else {
                                    double sim1 = wup.max(curSourceName,curTargetName,"n");
                                    double sim2 = wup.wup(curSourceName,1,curTargetName,1,"v");
//                                    masterSim = Double.max(sim1,sim2);
                                    masterSim = Math.max(sim1, sim2);
                                }
                            }else {
                                if(!curSourceName.equals(curTargetName)) {
                                    double sim1 = wup.max(curSourceName,curTargetName,"n");
                                    double sim2 = wup.wup(curSourceName,1,curTargetName,1,"v");
//                                    masterSim += Double.max(sim1,sim2);
                                    masterSim += Math.max(sim1, sim2);
                                    conSize++;
                                    break;
                                }
                            }
                        }

                        maxSim = masterSim/conSize;
                    }
                }
            }//暂时先不用这个
        }catch(Exception ex) {
            ex.printStackTrace();
        }
        return maxSim;
    }

    private static String convertToValidFormat(String word) {
        if(word.equals("")||word==null) return "";
        char firstChar = word.charAt(0);
        String finalWord = word;
        try {
            IndexWord curIndex = Dictionary.getInstance().getIndexWord(POS.NOUN,word);
            if(curIndex == null) {
                IndexWord stemWord = morph.lookupBaseForm(POS.NOUN,word);
                if(stemWord != null) finalWord = stemWord.getLemma();
                else {
                    stemWord = morph.lookupBaseForm(POS.VERB,word);
                }
                if(stemWord != null) finalWord = stemWord.getLemma();
            }
        } catch (JWNLException e) {
            e.printStackTrace();
        }
        return firstChar+finalWord.substring(1,finalWord.length());//保证首字母大写
    }

    static class NameSimilarity {
        String sourceName;
        String targetName;
        double similarity;

        public NameSimilarity(String sourceName, String targetName, double similarity) {
            this.sourceName = sourceName;
            this.targetName = targetName;
            this.similarity = similarity;
        }
    }
}
