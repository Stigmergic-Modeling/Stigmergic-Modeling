
package net.stigmod.service.migrateService;

import net.stigmod.domain.conceptualmodel.*;
//import net.stigmod.util.wordsim.WordSimilarities;
import net.stigmod.service.migrateService.migrateUtil.HeuristicMethod;
import net.stigmod.service.migrateService.migrateUtil.MigrateUtil;
import net.stigmod.service.migrateService.migrateUtil.SimulateHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.util.*;

/**
 *
 *
 * @version     2015/11/12
 * @author 	    Kai Fu
 */
@Service
public class MigrateHandlerImpl implements MigrateHandler {


    @Autowired
    private MigrateUtil migrateUtil;

    @Autowired
    private EntropyHandler entropyHandler;

    @Autowired
    private SimulateHandler simulateHandler;

    @Autowired
    private HeuristicMethod heuristicMethod;

    private List<ClassNode> classNodeList;

    private List<RelationNode> relationNodeList;

    private List<ValueNode> valueNodeList;

    private int nodeSum;

    private boolean isStable=false;

    private Long modelId;

    private double systemEntropy;

//    private int curLocId;

    /**
     * 每次执行migrateHandler进行融合操作之前,都需要执行一次migrateInit方法(当然该方法自动在migrateHandler中被调用)
     * @param modelId
     * @param cNodeList
     * @param rNodeList
     * @param vNodeList
     */
    public void migrateInit(Long modelId,List<ClassNode> cNodeList,List<RelationNode> rNodeList,
                            List<ValueNode> vNodeList) {
        //获取ccm中各种node的数据
        this.modelId = modelId;

        this.classNodeList = cNodeList;
        this.relationNodeList = rNodeList;
        this.valueNodeList = vNodeList;

        this.nodeSum=(classNodeList.size()+relationNodeList.size()+valueNodeList.size());
        this.isStable=false;
        this.systemEntropy = 0.0;
    }

    public void migrateInitForTest(List<ClassNode> classNodeList , List<RelationNode> relationNodeList ,
                                  List<ValueNode> valueNodeList , int loc) {
        modelId=0l;
        this.classNodeList = classNodeList;
        this.relationNodeList = relationNodeList;
        this.valueNodeList = valueNodeList;
        this.isStable=false;
        this.nodeSum=(classNodeList.size()+relationNodeList.size()+valueNodeList.size());
        this.systemEntropy = 0.0;
    }

    @Override
    public void migrateHandler() {//初始化各变量

        int cNum=0;
        int curIterNum=0;
        int iterNum = 0;

        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        System.out.println("算法运行启动时间为: " + df.format(new Date()));

        systemEntropy = entropyHandler.initNodeListEntropy(classNodeList,relationNodeList,valueNodeList,nodeSum);
        System.out.println("系统初始熵值为: "+systemEntropy);
        while(true) {
            iterNum++;
            System.out.println("融合算法迭代轮数: "+iterNum);
            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
            heuristicMigrateMethod();
            System.out.println("isStable: "+isStable+" ,curIterNum:"+curIterNum);
            if(isStable&&curIterNum>=1) break;
            else if(isStable) curIterNum++;
            else curIterNum=0;

            System.out.println("当前系统熵值为: "+systemEntropy);
        }
        System.out.println("------------------------------启发式迁移第一种结束--------------------------------");
//        while(true) {//此代码中采用的融合算法规则为随机选择节点进行融合迁移判断
//            iterNum++;
//            System.out.println("融合算法迭代轮数: "+iterNum);
//            isStable=true;//在migrateClassNode和migrateRelationNode中若发生迁移则会由isStable转为false;
//            int[] randomList=randomValue();
////            int[] randomList={0,41};
////            int[] randomList = {0,101,6,266,261,219,225,25,33,181,121,7,258,53,207,1,156,159,269,88,43,26,74,185,118,246,252,216,106,114,15,47,155,180,14,187,30,192,89,55,50,202,127,198,133,208,102,124,81,87,197,223,160,2,164,20,27,119,143,34,23,229,186,161,231,150,151,110,94,9,204,169,189,116,230,3,58,73,129,36,173,172,64,113,248,271,178,59,35,175,184,146,105,257,239,37,226,203,190,13,52,46,274,79,191,243,201,54,91,176,267,62,206,273,179,103,268,98,12,24,256,148,140,16,44,263,51,111,107,86,188,61,265,76,194,251,238,142,196,49,214,242,68,131,4,32,97,17,247,253,141,224,122,158,67,18,21,145,65,72,28,139,19,11,222,215,71,39,183,57,96,138,245,63,205,128,42,38,153,125,108,123,137,199,232,177,8,135,165,99,255,182,272,200,60,149,117,262,171,235,66,115,136,167,130,212,195,213,168,218,234,104,264,147,134,80,78,132,236,109,85,5,93,31,154,260,90,254,75,241,82,217,84,126,166,29,48,10,193,244,250,233,210,170,270,152,174,83,237,40,249,100,162,95,56,77,45,92,240,112,221,227,41,144,120,70,211,228,220,22,157,69,163,259,209};
//            int curSum=randomList.length;
//
//            for(int i=0;i<curSum;i++) {
//                System.out.print(randomList[i]+",");
//            }
//            System.out.println();
//
//            for(int i=0;i<curSum;i++) {
//
//                if(i != 0 && i % 10 == 0) {
//                    System.out.println("完成第"+iterNum+"轮迭代的第"+i+"次节点选择, 当前系统熵值为: "+systemEntropy);
//                    if(Math.abs(systemEntropy - 0.0) < 0.0001) break;
//                }
//
//                int randValue = randomList[i];
//                System.out.println("随机值: " + randValue);
////                scanToFindBug();
//
//                double testE = scanToComputeSystemEntropy();
//                System.out.println("当前测试的熵值为: "+ testE);
//                if(Math.abs(systemEntropy - testE) > 0.1) {
//                    System.out.println("熵值不等,当前测试的熵值为: "+ testE+",当前系统熵值为: "+systemEntropy);
//                }
//
//                if(randValue==74) {
//                    System.out.println("123");
//                }
//
//                cNum=classNodeList.size();//要不断更新cNum的值
//                if(randValue<cNum) migrateClassNodeWithNormalMethod(randValue);
//                else migrateRelationNodeWithNormalMethod(randValue - cNum);
//            }
//            System.out.println("isStable: "+isStable+" ,curIterNum:"+curIterNum);
//            if(isStable&&curIterNum>=2) break;
//            else if(isStable) curIterNum++;
//            else curIterNum=1;
//            System.out.println("当前系统熵值为: "+systemEntropy);
//        }

        System.out.println("算法运行结束时间为: " + df.format(new Date()));

        scanToFindBug();
        scanToValidateData();
        System.out.println("算法运行结束,系统熵值为: "+systemEntropy);

        //仅为测试用
//        int[] randomList=randomValue();
//        for(int i=0;i<randomList.length;i++) {
//            int randValue = randomList[i];
//            if(randValue==16||randValue==38) {
//                System.out.println("123");
//            }
//            if(randValue<cNum) migrateClassNodeWithNormalMethod(randValue);
//            else migrateRelationNodeWithNormalMethod(randValue - cNum);
//        }

        findFinalConceptModel();

        System.out.println("验证熵值为: " + scanToComputeSystemEntropy());
        System.out.println("迭代结束啦~");
    }

    private void heuristicMigrateMethod() {
        List<Integer> heuristicList = heuristicMethod.migrateWithHeuristicList(classNodeList,relationNodeList,valueNodeList);
        int cNodeSize = classNodeList.size();
        int rAndcNodeSize = relationNodeList.size()+cNodeSize;
        int hSize = heuristicList.size();
        for(int i=0;i<hSize;i++) {
            int curLoc = heuristicList.get(i);
            if(curLoc<cNodeSize) {//说明是classNode,目标是把他所有relationNode都融合
                List<Integer> rNodeLocs = heuristicMethod.getConRelationNodeForClassNode(classNodeList.get(curLoc));
                for(int rNodeLoc : rNodeLocs) {
                    RelationNode rNode = relationNodeList.get(rNodeLoc);
                    boolean isContinue = true;
                    for(RelationToValueEdge innerRtvEdge : rNode.getRtvEdges()) {
                        if(innerRtvEdge.getName().equals("isAttribute")) {
                            isContinue = false;
                            break;
                        }
                    }
                    if(isContinue) migrateRelationNode(rNode,rNodeLocs);//进行迁移操作
                }
            }else if(curLoc<rAndcNodeSize) {//说明是relationNode
                List<Integer> cNodeLocs = heuristicMethod.getConClassNodeForRelationNode(relationNodeList.get(curLoc-cNodeSize));
                for(int cNodeLoc : cNodeLocs) {
                    ClassNode cNode = classNodeList.get(cNodeLoc);
                    migrateClassNode(cNode,cNodeLocs);
                }
            }else {//说明是valueNode
                ValueNode curVNode = valueNodeList.get(curLoc - rAndcNodeSize);
                String curVName = curVNode.getName();
                if(curVName.equals("true")||curVName.equals("1")||curVName.equals("1..2")||curVName.equals("0..1")||
                        curVName.equals("1..*")||curVName.equals("*")) continue;
                List<Integer> cNodeLocs = heuristicMethod.getConClassNodeForValueNode(curVNode);
                List<Integer> rNodeLocs = heuristicMethod.getConRelationNodeForValueNode(curVNode);

                for(int cNodeLoc : cNodeLocs) {
                    ClassNode cNode = classNodeList.get(cNodeLoc);
                    migrateClassNode(cNode,cNodeLocs);
                }
                for(int rNodeLoc : rNodeLocs) {
                    RelationNode rNode = relationNodeList.get(rNodeLoc);
                    migrateRelationNode(rNode,rNodeLocs);//进行迁移操作
                }
            }
        }
    }

    private void migrateClassNodeWithNormalMethod(int classNodeListId) {
        ClassNode classNode = classNodeList.get(classNodeListId);
        if(classNode.getIcmSet().size()==0) return ;

        //找到所有和当前classNode有交集的其他classNode节点
        List<Integer> needToFindCNodeListIdSet = migrateUtil.findConClassNodes(classNode,valueNodeList);
        migrateClassNode(classNode,needToFindCNodeListIdSet);
    }

    private void migrateRelationNodeWithNormalMethod(int relationNodeListId) {
        RelationNode relationNode = relationNodeList.get(relationNodeListId);
        if(relationNode.getIcmSet().size()==0) return ;

        //找到所有和当前relationNode有交集的其他relationNode节点
        List<Integer> needToFindRNodeListIdSet = migrateUtil.findConRelationNodes(relationNode,valueNodeList);
        migrateRelationNode(relationNode, needToFindRNodeListIdSet);
    }

    private void migrateClassNode(ClassNode classNode,List<Integer> needToFindCNodeListIdSet) {
        Map<String,Set<Long>> userSetMap = migrateUtil.getTheUserSetForClassNode(classNode);
        List<String> uNameKeyList = new ArrayList<>();
        sortTheUNameKeyList(uNameKeyList,classNode.getIcmSet(),userSetMap);

        if(classNode.getIcmSet().size()>=1) {
            for(String userKey : uNameKeyList) {
                Set<Long> uSet = userSetMap.get(userKey);
                if(uSet.size() == 0) continue;
                else findLowerEntropyLocForClass(uSet,classNode.getLoc(),needToFindCNodeListIdSet);
            }
        }
    }

    private void migrateRelationNode(RelationNode relationNode,List<Integer> needToFindRNodeListIdSet) {
        Map<String,Set<Long>> userSetMap = migrateUtil.getTheUserSetForRelationNode(relationNode);
        List<String> uNameKeyList = new ArrayList<>();
        sortTheUNameKeyList(uNameKeyList,relationNode.getIcmSet(),userSetMap);

        if(relationNode.getIcmSet().size()>=1) {
            for(String userKey : uNameKeyList) {
                Set<Long> uSet = userSetMap.get(userKey);
                if(uSet.size() == 0) continue;
                else findLowerEntropyLocForRelation(uSet,relationNode.getLoc(),needToFindRNodeListIdSet);
            }
        }
    }

    private void setSettleValueForClassMigrate(int sourceCNodeListId,int targetCNodeListId) {
        ClassNode sourceCNode = classNodeList.get(sourceCNodeListId);
        ClassNode targetCNode = classNodeList.get(targetCNodeListId);
        sourceCNode.setIsSettled(false);
        targetCNode.setIsSettled(false);
        for(RelationToClassEdge rtcEdge : sourceCNode.getRtcEdges()) {
            RelationNode rNode = rtcEdge.getStarter();
            rNode.setIsSettled(false);
        }
    }

    private void setSettleValueForRelationMigrate(int sourceRNodeListId,int targetRNodeListId) {
        RelationNode sourceRNode = relationNodeList.get(sourceRNodeListId);
        RelationNode targetRNode = relationNodeList.get(targetRNodeListId);
        sourceRNode.setIsSettled(false);
        targetRNode.setIsSettled(false);
        for(RelationToClassEdge rtcEdge : sourceRNode.getRtcEdges()) {
            ClassNode cNode = rtcEdge.getEnder();
            cNode.setIsSettled(false);
        }
    }

    private void findLowerEntropyLocForClass(Set<Long> icmSet , int sourceClassNodeListId ,
                                             List<Integer> needToFindCNodeListIdSet) {
        //注意,这里的ListId不是Node本身的id,而是classNodeList中该节点的id.
        //!!!要区分ListId和Id的区别
        double maxEntropyDecrease = 0.0;
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);
        int targetClassNodeListId = -1; //因为我们目标是全局最小的熵值节点
        int icmSetSize = icmSet.size();
        boolean isTravseNullNode = false;//标注是否遍历过包含0用户的节点(即空节点)
        List<Integer> haveConNodeIdSet = new ArrayList<>();//有公共用户的节点集合
        boolean sourceCNodeSettleStatus = sourceClassNode.getIsSettled();//该节点是否被融合过的状态
        double testE3 = scanToComputeSystemEntropy();

        for(int tmpListId : needToFindCNodeListIdSet) {
            if(tmpListId == sourceClassNodeListId) continue;
            ClassNode tmpCNode = classNodeList.get(tmpListId);

            boolean targetIsNullFlag = false;
            if(isTravseNullNode && tmpCNode.getIcmSet().size()==0) continue;

            Set<Long> tmpResSet = new HashSet<>(tmpCNode.getIcmSet());
            tmpResSet.retainAll(icmSet);
            if(tmpResSet.size()!=0) {
                haveConNodeIdSet.add(tmpCNode.getLoc());
                continue;
            }

            boolean tmpCNodeSettleStatus = tmpCNode.getIsSettled();
            if(sourceCNodeSettleStatus==true&&tmpCNodeSettleStatus==true) continue;//如果两个节点都是属于被settle过的节点,则不需要在进行判断了

            if(tmpCNode.getIcmSet().size() == 0) {
                isTravseNullNode = true;
                targetIsNullFlag = true;
            }

            double var = simulateHandler.simulateMigrateForClass(icmSet, sourceClassNode, tmpCNode, nodeSum, systemEntropy, targetIsNullFlag);
            if((Double.compare(maxEntropyDecrease , var) > 0 && Math.abs(maxEntropyDecrease - var) > 0.00001)
                    || (Double.compare(var,maxEntropyDecrease) == 0
                    && sourceClassNode.getIcmSet().size() - icmSetSize == 0 && tmpCNode.getIcmSet().size() != 0)) {
                maxEntropyDecrease = var;
                targetClassNodeListId = tmpCNode.getLoc();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isTravseNullNode) {
            ClassNode classNode2 = new ClassNode();
            classNode2.setLoc(classNodeList.size());
            double var2 = simulateHandler.simulateMigrateForClass(icmSet, sourceClassNode, classNode2, nodeSum, systemEntropy, true);
            if(Double.compare(maxEntropyDecrease , var2) > 0 && Math.abs(maxEntropyDecrease - var2) > 0.00001) {
//              classNodeRepository.save(classNode2);//在数据库中保存该节点
                classNodeList.add(classNode2);//在classNodeList中添加节点classNode2
                maxEntropyDecrease = var2;
                targetClassNodeListId = classNode2.getLoc();
            }
        }

        if(targetClassNodeListId!=-1) {
//            double testE2 = scanToComputeSystemEntropy();

            if(sourceClassNode.getIcmSet().size()-icmSetSize==0) this.nodeSum--;
            if(classNodeList.get(targetClassNodeListId).getIcmSet().size() == 0) this.nodeSum++;


            migrateClassNodeForOneStep(icmSet , sourceClassNodeListId , targetClassNodeListId);
            reComputeMigrateClassNodeEntropy(sourceClassNodeListId,targetClassNodeListId);
            setSettleValueForClassMigrate(sourceClassNodeListId,targetClassNodeListId);//设置false
            removeNullEdgeForClassNode(sourceClassNodeListId);//删除多余边
            systemEntropy += maxEntropyDecrease;

            double testE = scanToComputeSystemEntropy();
            if(Math.abs(systemEntropy - testE) > 0.1) {
                System.out.println("发生熵值不等错误0001: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+",初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+targetClassNodeListId);
            }
            System.out.println("发生迁移操作,用户集合为:"+icmSet+" ,sourceClassNodeListId为:"+sourceClassNodeListId+
                    " ,targetClassNodeListId为:"+targetClassNodeListId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }


        //2: 说明整个集合一起迁移这种想法没有成功，下面就来单独迁移了
        if(targetClassNodeListId==-1) {
            List<Long> curIcmIdSet = new ArrayList<Long>(icmSet);

            if(icmSetSize > 1) {//这段代码是指当用户数大于1时，由于之前的迁移遗漏了部分节点，所以现在要把他们重新遍历
                for(int listId : haveConNodeIdSet) {
                    ClassNode tmpCNode = classNodeList.get(listId);
                    boolean tmpCNodeSettleStatus = tmpCNode.getIsSettled();
                    if(sourceCNodeSettleStatus==true && tmpCNodeSettleStatus==true) continue;

                    Set<Long> tmpResSet = new HashSet<>(tmpCNode.getIcmSet());
                    if(tmpResSet.size()==0) continue;
                    tmpResSet.retainAll(curIcmIdSet);//就是获得当前节点与curIcmIdSet中重合的节点数
                    Set<Long> curResSet = new HashSet<>(curIcmIdSet);
                    curResSet.removeAll(tmpResSet);
                    if(curResSet.size() == 0) continue;
                    double var = simulateHandler.simulateMigrateForClass(curResSet, sourceClassNode, tmpCNode,
                            nodeSum, systemEntropy, false);
                    if((Double.compare(0.0 , var) > 0 && Math.abs(0.0 - var) > 0.00001)) {
                        migrateClassNodeForOneStep(curResSet , sourceClassNodeListId , tmpCNode.getLoc());
                        reComputeMigrateClassNodeEntropy(sourceClassNodeListId,tmpCNode.getLoc());
                        setSettleValueForClassMigrate(sourceClassNodeListId,tmpCNode.getLoc());//设置false
                        removeNullEdgeForClassNode(sourceClassNodeListId);//删除多余边
                        systemEntropy += var;

                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0001: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+",初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+targetClassNodeListId);
                        }
                        System.out.println("发生迁移操作,用户集合为:"+curResSet+" ,sourceClassNodeListId为:"+sourceClassNodeListId+
                                " ,targetClassNodeListId为:"+tmpCNode.getLoc());

                        curIcmIdSet.removeAll(curResSet);
                    }
                    if(curIcmIdSet.size()==0) break;
                }
            }

            Collections.sort(curIcmIdSet, new Comparator<Long>() {
                @Override
                public int compare(Long o1, Long o2) {
                    long a = o1;
                    long b = o2;
                    return (int)(a-b);
                }
            });

//            System.out.println("已排序,数组顺序为:"+curIcmIdSet);

            for(long curIcmId : curIcmIdSet) {
                for(int listId : haveConNodeIdSet) {
                    if(classNodeList.get(listId).getIcmSet().contains(curIcmId)) {
                        double testE2 = scanToComputeSystemEntropy();

                        double twoStepVar=migrateClassNodeNeedTwoStep(curIcmId , sourceClassNodeListId ,listId);
                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0003: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceClassNodeListId+"目标节点Listid:"+listId);
                        }
                        if(Double.compare(twoStepVar,0.0)<0 && Math.abs(twoStepVar-0.0)>0.00001) {
                            isStable=false;
                            return;//这部分搞定就可以直接结束了
                        }
                    }else continue;
                }
            }
        }
    }



    /**
     * 将用户集合从一个class节点迁移到另一个class节点,这个是一步的,因为另一个class节点一定不包含该用户集合
     * @param icmSet
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public void migrateClassNodeForOneStep(Set<Long> icmSet,int sourceClassNodeListId,int targetClassNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);

//        sourceClassNode.getIcmSet().removeAll(icmSet);
//        targetClassNode.getIcmSet().addAll(icmSet);

        sourceClassNode.removeIcmSetFromSet(icmSet);
        targetClassNode.addIcmSetFromSet(icmSet);

        Long oneIcmId = icmSet.iterator().next();//获取一个标杆icm

        for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges())
            ctvEdge2.setIsChanged(false);

        //对于sourceClassNode的classToValue部分
        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges()) {
            ctvEdge.setIsChanged(false);
            if(ctvEdge.getIcmSet().size()==0||!ctvEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }

            ctvEdge.setIcmSetPreCopy(new HashSet<>(ctvEdge.getIcmSet()));//将这个存储一个备份
            ctvEdge.setIsChanged(true);//标记这个值被改变了

//            ctvEdge.getIcmSet().removeAll(icmSet);
            ctvEdge.removeIcmSetFromSet(icmSet);
            String edgeName=ctvEdge.getName();
            ValueNode valueNode=ctvEdge.getEnder();
            //下面要把该边上的该用户从sourceClassNode迁移到targetClassNode

            boolean isContainFlag=false;
            for(ClassToValueEdge ctvEdge2 : targetClassNode.getCtvEdges()) {
                if (ctvEdge2.getName().equals(edgeName) && ctvEdge2.getEnder().equals(valueNode)) {
                    ctvEdge2.setIcmSetPreCopy(new HashSet<Long>(ctvEdge2.getIcmSet()));//将这个存储一个备份
                    ctvEdge2.setIsChanged(true);
                    isContainFlag=true;
//                    ctvEdge2.getIcmSet().addAll(icmSet);
                    ctvEdge2.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.addAll(icmSet);
                ClassToValueEdge tmpCtvEdge=new ClassToValueEdge(edgeName,targetClassNode,valueNode);
                tmpCtvEdge.setIcmSet(tTmpSet);
                tmpCtvEdge.setIsChanged(true);
                tmpCtvEdge.setIcmSetPreCopy(new HashSet<Long>());
//                tmpCtvEdge.setLoc(curLocId++);
                targetClassNode.getCtvEdges().add(tmpCtvEdge);
                valueNode.getCtvEdges().add(tmpCtvEdge);
//                classToVEdgeRepository.save(tmpCtvEdge);//classToVEdgeRepository这个
            }
        }

        //对于sourceClassNode的relationToClass部分
        //先把targetClassNode的rtc边全部置为false的flag标志
        for(RelationToClassEdge rtcEdge2 : targetClassNode.getRtcEdges())
            rtcEdge2.setIsChanged(false);

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            rtcEdge.setIsChanged(false);
            if(rtcEdge.getIcmSet().size()==0||!rtcEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }
            rtcEdge.setIcmSetPreCopy(new HashSet<>(rtcEdge.getIcmSet()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
//            rtcEdge.getIcmSet().removeAll(icmSet);
            rtcEdge.removeIcmSetFromSet(icmSet);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getName();
            RelationNode relationNode=rtcEdge.getStarter();
            //下面要把改变上的该用户从sourceClassNode迁移到targetClassNode上去
            boolean isContainFlag=false;
            for(RelationToClassEdge rtcEdge2 : targetClassNode.getRtcEdges()) {
                if(rtcEdge2.getPort().equals(port)&&rtcEdge2.getName().equals(edgeName)
                        &&rtcEdge2.getStarter().equals(relationNode)) {
                    rtcEdge2.setIcmSetPreCopy(new HashSet<Long>(rtcEdge2.getIcmSet()));//将这个存储一个备份
                    rtcEdge2.setIsChanged(true);
                    isContainFlag=true;
//                    rtcEdge2.getIcmSet().addAll(icmSet);
                    rtcEdge2.addIcmSetFromSet(icmSet);
                    break;
                }
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>();
                tTmpSet.addAll(icmSet);
                RelationToClassEdge tmpRtcEdge=new RelationToClassEdge(port,edgeName,relationNode,targetClassNode);
                tmpRtcEdge.setIcmSet(tTmpSet);
//                tmpRtcEdge.setLoc(curLocId++);
                targetClassNode.getRtcEdges().add(tmpRtcEdge);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setIcmSetPreCopy(new HashSet<Long>());
                relationNode.getRtcEdges().add(tmpRtcEdge);
//                relationToCEdgeRepository.save(tmpRtcEdge);
            }
        }
    }

    private Double migrateClassNodeWithMutual(Long icmId,int sourceClassNodeListId,int targetClassNodeListId) {
        Set<Long> curIdSet = new HashSet<>();
        curIdSet.add(icmId);

        double resVar = moveClassNodeForMutualDetail(curIdSet,sourceClassNodeListId,targetClassNodeListId);
        if(Double.compare(resVar,0.0)<0 && Math.abs(resVar - 0.0)>0.000001) return resVar;
        else {
            //这就需要恢复程序了,其实就是再次互换位置
            moveClassNodeForMutualDetail(curIdSet,sourceClassNodeListId,targetClassNodeListId);
            return resVar;
        }
    }

    private Double moveClassNodeForMutualDetail(Set<Long> curIdSet,int sourceClassNodeListId,int targetClassNodeListId) {
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);

//        System.out.print("互换迁移前系统熵值: "+systemEntropy);
        //这是第一步迁移操作,先把sourceCNode迁移到一个空节点上
        double var1 = 0x7FFFFFFF;
        int varLoc1 = -1;
        ClassNode tClassNode=new ClassNode();
        tClassNode.setLoc(classNodeList.size());
        classNodeList.add(tClassNode);
        var1=simulateHandler.simulateMigrateForClass(curIdSet, sourceClassNode, tClassNode, nodeSum, systemEntropy, true);
        varLoc1 = tClassNode.getLoc();

        if(sourceClassNode.getIcmSet().size()==1) this.nodeSum--;
        this.nodeSum++;//由于新增一个节点,因此需要添加该节点
        migrateClassNodeForOneStep(curIdSet, sourceClassNodeListId, varLoc1);

        systemEntropy += var1;
        reComputeMigrateClassNodeEntropy(sourceClassNodeListId,varLoc1);
        removeNullEdgeForClassNode(sourceClassNodeListId);

        //下面是第二步迁移操作,把用户从targetCNode迁移到sourceCNode上去
        double var2 = 0x7FFFFFFF;
        boolean isNullNode = false;
        if(sourceClassNode.getIcmSet().size()==0) isNullNode = true;
        var2=simulateHandler.simulateMigrateForClass(curIdSet, targetClassNode, sourceClassNode, nodeSum, systemEntropy, isNullNode);
        if(targetClassNode.getIcmSet().size()==1) this.nodeSum--;
        if(sourceClassNode.getIcmSet().size()==0) this.nodeSum++;
        migrateClassNodeForOneStep(curIdSet, targetClassNodeListId, sourceClassNodeListId);

        systemEntropy += var2;
        reComputeMigrateClassNodeEntropy(targetClassNodeListId,sourceClassNodeListId);
        removeNullEdgeForClassNode(targetClassNodeListId);

        //下面是第三步迁移操作,把用户从tClassNode迁移到targetCNode上去
        double var3 = 0x7FFFFFFF;
        isNullNode = false;
        if(targetClassNode.getIcmSet().size()==0) isNullNode = true;
        var3=simulateHandler.simulateMigrateForClass(curIdSet,tClassNode,targetClassNode,nodeSum,systemEntropy,isNullNode);
        this.nodeSum--;//去掉tClassNode
        if(targetClassNode.getIcmSet().size()==0) this.nodeSum++;
        migrateClassNodeForOneStep(curIdSet, varLoc1, targetClassNodeListId);

        systemEntropy += var3;
        reComputeMigrateClassNodeEntropy(varLoc1,targetClassNodeListId);
        removeNullEdgeForClassNode(varLoc1);

        //删除空节点tClassNode
        tClassNode = null;
        classNodeList.remove(varLoc1);

//        System.out.println(" ,互换迁移后系统熵值: " + systemEntropy);

        double resVar = var1+var2+var3;
        return resVar;
    }

    /**
     * 目标是返回当前sourceClass上的用户迁移到targetClass上系统熵值减小/增加幅度
     * @param icmId
     * @param sourceClassNodeListId
     * @param targetClassNodeListId
     */
    public Double migrateClassNodeNeedTwoStep(Long icmId,int sourceClassNodeListId,int targetClassNodeListId) {
        //首先是判断如果targetClass没有当前icmId用户,将sourceClass上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetClass上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        ClassNode sourceClassNode=classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode=classNodeList.get(targetClassNodeListId);
        Set<Long> curIdSet = new HashSet<>();
        curIdSet.add(icmId);

        //先判断能否相互迁移
        double mutualVar = migrateClassNodeWithMutual(icmId,sourceClassNodeListId,targetClassNodeListId);
        if(Double.compare(mutualVar,0.0)<0 && Math.abs(mutualVar-0.0)>0.00001) return mutualVar;
        //由于在模拟迁移之后若系统总熵值不能减小,我们则需要将这些节点还原

        double minEntropyDown=0x7FFFFFFF;
        int minVarCNodeListId=-1;  //我们希望找到的是引起targetClass节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况

        List<Integer> thirdPartCNodeListIdSet = migrateUtil.findConClassNodes(targetClassNode,valueNodeList);
        boolean sourceCNodeSettleStatus = sourceClassNode.getIsSettled();


        //这里的目标是把target上的class节点迁移到otherClassNode上去,看看是否有效果
        for(int tmpListId : thirdPartCNodeListIdSet) {
            ClassNode otherClassNode = classNodeList.get(tmpListId);
            boolean otherCNodeSettleStatus = otherClassNode.getIsSettled();
            if(sourceCNodeSettleStatus==true && otherCNodeSettleStatus==true) continue;

            boolean targetIsNullFlag = false;
            if(isTravseNUllNode && otherClassNode.getIcmSet().size()==0) continue;
            if(otherClassNode.getIcmSet().size() == 0) {
                targetIsNullFlag=true;
                isTravseNUllNode=true;
            }
            if(otherClassNode.getIcmSet().contains(icmId)) continue;
            double var=simulateHandler.simulateMigrateForClass(curIdSet, targetClassNode, otherClassNode, nodeSum,
                    systemEntropy, targetIsNullFlag);
            if((Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001 )
                    || (Double.compare(var,minEntropyDown)==0 &&
                    targetClassNode.getIcmSet().size() == 1 && otherClassNode.getIcmSet().size() != 0)) {
                minEntropyDown=var;
                minVarCNodeListId=otherClassNode.getLoc();
            }
        }

        boolean isUsedNullNode = false;//是否使用了空节点
        if(!isTravseNUllNode && targetClassNode.getIcmSet().size()!=1) {
            ClassNode tClassNode=new ClassNode();
            tClassNode.setLoc(classNodeList.size());
            double var=simulateHandler.simulateMigrateForClass(curIdSet,targetClassNode,tClassNode,nodeSum,
                    systemEntropy,true);
            if(Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001) {
                isUsedNullNode=true;
                minEntropyDown=var;
                classNodeList.add(tClassNode);
                minVarCNodeListId=tClassNode.getLoc();
            }else tClassNode=null;
        }

        int recoverNodeSum = this.nodeSum;//将nodeSum的值保存起来了
        double recoverSystemEntropy = systemEntropy;

        if(minVarCNodeListId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

            //将targetClass上的icmId正式迁移到minVarCNodeId节点上去
            if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
            if(classNodeList.get(minVarCNodeListId).getIcmSet().size()==0) this.nodeSum++;
            migrateClassNodeForOneStep(curIdSet, targetClassNodeListId, minVarCNodeListId);

            systemEntropy += minEntropyDown;
            reComputeMigrateClassNodeEntropy(targetClassNodeListId,minVarCNodeListId);
            //如果需要恢复到迁移前,则在下面启动恢复过程
        }else return 0.0;
        //上面这个migrateClassNodeForOneStep实实在在的把targetClassNode上的icmId迁移到了minVarCNodeId对应节点上

        boolean secondStepFlag=false;
        if(targetClassNode.getIcmSet().size()==0) secondStepFlag=true;
        double simVar=simulateHandler.simulateMigrateForClass(curIdSet, sourceClassNode, targetClassNode, nodeSum,
                systemEntropy, secondStepFlag);
        if((Double.compare(simVar,0.0)>=0 && Math.abs(simVar-0.0)>0.00001) || Math.abs(simVar - 0.0)<0.00001) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0) > 0 ||
                    ((Double.compare(minEntropyDown,0.0) == 0 || Math.abs(minEntropyDown - 0.0)<0.00001)
                            && !(targetClassNode.getIcmSet().size() == 0 &&
                            classNodeList.get(minVarCNodeListId).getIcmSet().size()>1)) ) {
                //需要复原之前的迁移
                recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);
                recoverEdgeStateForClassNode(targetClassNodeListId);
                recoverEdgeStateForClassNode(minVarCNodeListId);
                recoverMigrateClassNode(targetClassNodeListId,minVarCNodeListId);
                removeRecoverClassNullNode(minVarCNodeListId);
                systemEntropy = recoverSystemEntropy;
                this.nodeSum=recoverNodeSum;
            }else {
                setSettleValueForClassMigrate(targetClassNodeListId,minVarCNodeListId);//设置false
                removeNullEdgeForClassNode(targetClassNodeListId);
                System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+targetClassNodeListId+
                        " ,minVarCNodeListId为:"+minVarCNodeListId+" ,减小熵值为: "+minEntropyDown);
                isStable=false;
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>0 ||
                    (Double.compare(minEntropyDown,0.0) == 0 && !(targetClassNode.getIcmSet().size() == 0 &&
                            classNodeList.get(minVarCNodeListId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0) {//说明迁移后系统熵值减小,这是成功的
                    if(classNodeList.get(sourceClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
                    if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==0) this.nodeSum++;
                    setSettleValueForClassMigrate(targetClassNodeListId,minVarCNodeListId);//设置false
                    removeNullEdgeForClassNode(targetClassNodeListId);
                    migrateClassNodeForOneStep(curIdSet,sourceClassNodeListId,targetClassNodeListId);
                    reComputeMigrateClassNodeEntropy(sourceClassNodeListId, targetClassNodeListId);
                    setSettleValueForClassMigrate(sourceClassNodeListId,targetClassNodeListId);//设置false
                    removeNullEdgeForClassNode(sourceClassNodeListId);
                    systemEntropy += simVar;
                    isStable=false;
                    System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+
                            targetClassNodeListId+ " ,minVarCNodeListId为:"+minVarCNodeListId+" ,减小熵值为: "+minEntropyDown);
                    System.out.println("发生双步迁移操作:次步成功,用户编号:"+icmId+" ,sourceClassNodeListId为:"+
                            sourceClassNodeListId+ " ,targetClassNodeListId为:"+targetClassNodeListId);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForClassNode(icmId,targetClassNodeListId,minVarCNodeListId,isUsedNullNode);//还原节点的原有格局
                    recoverEdgeStateForClassNode(targetClassNodeListId);
                    recoverEdgeStateForClassNode(minVarCNodeListId);
                    recoverMigrateClassNode(targetClassNodeListId,minVarCNodeListId);
                    removeRecoverClassNullNode(minVarCNodeListId);
                    this.nodeSum=recoverNodeSum;
                    systemEntropy = recoverSystemEntropy;
                }
            }else {
                //成功,我们需要将souceClass上的icmId用户迁移到targetClass上去
                if(classNodeList.get(sourceClassNodeListId).getIcmSet().size()==1) this.nodeSum--;
                if(classNodeList.get(targetClassNodeListId).getIcmSet().size()==0) this.nodeSum++;
                setSettleValueForClassMigrate(targetClassNodeListId,minVarCNodeListId);//设置false
                removeNullEdgeForClassNode(targetClassNodeListId);
                migrateClassNodeForOneStep(curIdSet,sourceClassNodeListId,targetClassNodeListId);
                reComputeMigrateClassNodeEntropy(sourceClassNodeListId,targetClassNodeListId);
                setSettleValueForClassMigrate(sourceClassNodeListId,targetClassNodeListId);//设置false
                removeNullEdgeForClassNode(sourceClassNodeListId);
                systemEntropy += simVar;
                isStable=false;
                System.out.println("发生双步迁移操作:首步成功,用户编号:"+icmId+" ,targetClassNodeListId为:"+
                        targetClassNodeListId+ " ,minVarCNodeListId为:"+minVarCNodeListId+" ,减小熵值为: "+minEntropyDown);
                System.out.println("发生双步迁移操作:次步成功,用户编号:"+icmId+" ,sourceClassNodeListId为:"+
                        sourceClassNodeListId+ " ,targetClassNodeListId为:"+targetClassNodeListId);
            }
        }
        return simVar+minEntropyDown;
    }

    private void findLowerEntropyLocForRelation(Set<Long> icmSet , int sourceRelationNodeListId , List<Integer> needToFindRNodeListIdSet) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);
        double maxEntropyDecrease=0.0;
        int targetRelationNodeId=-1;
        int icmSetSize = icmSet.size();
        boolean isNullNode=false;
        List<Integer> haveConNodeIdSet = new ArrayList<>();
        boolean sourceRNodeSettleStatus = sourceRelationNode.getIsSettled();

        for(int tmpListId : needToFindRNodeListIdSet) {
            if(tmpListId == sourceRelationNodeListId) continue;
            RelationNode tmpRNode = relationNodeList.get(tmpListId);

            boolean targetIsNullFlag = false;
            if(isNullNode && tmpRNode.getIcmSet().size()==0) continue;

            Set<Long> tmpResSet = new HashSet<>(tmpRNode.getIcmSet());
            tmpResSet.retainAll(icmSet);
            if(tmpResSet.size()!=0) {
                haveConNodeIdSet.add(tmpRNode.getLoc());
                continue;
            }

            boolean tmpRNodeSettleStatus = tmpRNode.getIsSettled();
            if(sourceRNodeSettleStatus==true&&tmpRNodeSettleStatus==true) continue;//放在这里,则haveConNodeIdSet中可能包含该类节点

            if(tmpRNode.getIcmSet().size()==0) {
                isNullNode=true;
                targetIsNullFlag=true;
            }

            double var=simulateHandler.simulateMigrateForRelation(icmSet, sourceRelationNode, tmpRNode, nodeSum,
                    systemEntropy, targetIsNullFlag);
            if((Double.compare(maxEntropyDecrease,var)>0 && Math.abs(maxEntropyDecrease - var) > 0.00001)
                    || (Double.compare(var , maxEntropyDecrease) == 0 &&
                    sourceRelationNode.getIcmSet().size()-icmSet.size() == 0 && tmpRNode.getIcmSet().size() != 0)) {
                maxEntropyDecrease=var;
                targetRelationNodeId=tmpRNode.getLoc();
            }
        }

        //除了将用户迁移到不包含该用户的节点上之外,还有两部分的工作要做
        //1: 判断该用户自己迁移到一个新的节点上,系统熵值是否会下降
        if(!isNullNode) {
            RelationNode relationNode2=new RelationNode();
            relationNode2.setLoc(relationNodeList.size());
            double var2=simulateHandler.simulateMigrateForRelation(icmSet, sourceRelationNode, relationNode2, nodeSum,
                    systemEntropy, true);
            if(Double.compare(maxEntropyDecrease,var2)>0 && Math.abs(maxEntropyDecrease - var2) > 0.00001) {
                relationNodeList.add(relationNode2);
                maxEntropyDecrease=var2;
                targetRelationNodeId=relationNode2.getLoc();
            }
        }

        if(targetRelationNodeId!=-1) {
            if(sourceRelationNode.getIcmSet().size() - icmSet.size() == 0) this.nodeSum--;
            if(relationNodeList.get(targetRelationNodeId).getIcmSet().size() == 0) this.nodeSum++;
            migrateRelationNodeForOneStep(icmSet, sourceRelationNodeListId, targetRelationNodeId);
            reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeId);
            setSettleValueForRelationMigrate(sourceRelationNodeListId, targetRelationNodeId);//设置false
            removeNullEdgeForRelationNode(sourceRelationNodeListId);

            systemEntropy += maxEntropyDecrease;

            double testE = scanToComputeSystemEntropy();
            if(Math.abs(systemEntropy - testE) > 0.1) {
                System.out.println("发生熵值不等错误0006: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                        "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+targetRelationNodeId);
            }
            System.out.println("发生迁移操作,用户集合:"+icmSet+" ,sourceRelationNodeListId为:"+
                    sourceRelationNodeListId+ " ,targetRelationNodeId为:"+targetRelationNodeId);
            isStable=false;//记录当前程序是否发生过迁移
            return;
        }

        //2: 判断该用户迁移到其他包含该用户的节点上,系统熵值是否会下降
        if(targetRelationNodeId==-1) {
            List<Long> curIcmIdSet = new ArrayList<>(icmSet);
            if(icmSetSize > 1) {//这段代码是指当用户数大于1时，由于之前的迁移遗漏了部分节点，所以现在要把他们重新遍历
                for(int listId : haveConNodeIdSet) {
                    RelationNode tmpRNode = relationNodeList.get(listId);
                    boolean tmpRNodeSettleStatus = tmpRNode.getIsSettled();
                    if(sourceRNodeSettleStatus==true && tmpRNodeSettleStatus==true) continue;

                    Set<Long> tmpResSet = new HashSet<>(tmpRNode.getIcmSet());
                    if(tmpResSet.size()==0) continue;
                    tmpResSet.retainAll(curIcmIdSet);//就是获得当前节点与curIcmIdSet中重合的节点数
                    Set<Long> curResSet = new HashSet<>(curIcmIdSet);
                    curResSet.removeAll(tmpResSet);
                    if(curResSet.size() == 0) continue;
                    double var = simulateHandler.simulateMigrateForRelation(curResSet, sourceRelationNode, tmpRNode,
                            nodeSum, systemEntropy, false);
                    if((Double.compare(0.0 , var) > 0 && Math.abs(0.0 - var) > 0.00001)) {
                        migrateRelationNodeForOneStep(curResSet , sourceRelationNodeListId , tmpRNode.getLoc());
                        reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,tmpRNode.getLoc());
                        setSettleValueForRelationMigrate(sourceRelationNodeListId, tmpRNode.getLoc());//设置false
                        removeNullEdgeForRelationNode(sourceRelationNodeListId);//删除多余边
                        systemEntropy += var;

                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0005: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+tmpRNode.getLoc());
                        }
                        System.out.println("发生迁移操作,用户集合为:"+curResSet+" ,sourceRelationNodeListId为:"+sourceRelationNodeListId+
                                " ,targetRelationNodeListId为:"+tmpRNode.getLoc());

                        curIcmIdSet.removeAll(curResSet);
                    }
                    if(curIcmIdSet.size()==0) break;
                }
            }

            Collections.sort(curIcmIdSet, new Comparator<Long>() {
                @Override
                public int compare(Long o1, Long o2) {
                    long a = o1;
                    long b = o2;
                    return (int)(a-b);
                }
            });
//            System.out.println("已排序,数组顺序为:"+curIcmIdSet);

            for(Long curIcmId : curIcmIdSet) {
                for(int listId : haveConNodeIdSet) {
                    if(relationNodeList.get(listId).getIcmSet().contains(curIcmId)) {
                        double testE2 = scanToComputeSystemEntropy();
                        double twoStepVar=migrateRelationNodeNeedTwoStep(curIcmId , sourceRelationNodeListId ,listId);
                        double testE = scanToComputeSystemEntropy();
                        if(Math.abs(systemEntropy - testE) > 0.1) {
                            System.out.println("发生熵值不等错误0005: "+"系统熵值: "+systemEntropy+" ,测试熵值: "+testE+"," +
                                    "初始节点Listid: "+sourceRelationNodeListId+"目标节点Listid:"+listId);
                        }
                        if(Double.compare(twoStepVar,0.0)<0 && Math.abs(twoStepVar-0.0)>0.00001) {
                            isStable=false;
                            return;//这部分搞定就可以直接结束了
                        }
                    }else continue;
                }
            }
        }
    }



    public void migrateRelationNodeForOneStep(Set<Long> icmSet,int sourceRelationNodeListId,int targetRelationNodeListId) {
        //这个地方涉及数据库的操作,我必须要非常小心这一点
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

//        sourceRelationNode.getIcmSet().removeAll(new HashSet<>(icmSet));
//        targetRelationNode.getIcmSet().addAll(new HashSet<>(icmSet));
        sourceRelationNode.removeIcmSetFromSet(icmSet);
        targetRelationNode.addIcmSetFromSet(icmSet);

        Long oneIcmId = icmSet.iterator().next();

        //对于sourceRelationNode的RelationToValue部分
        for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges())
            rtvEdge_target.setIsChanged(false);

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            rtvEdge.setIsChanged(false);
            if(rtvEdge.getIcmSet().size()==0||!rtvEdge.getIcmSet().contains(oneIcmId)) {
                continue;
            }

            rtvEdge.setIcmSetPreCopy(new HashSet<>(rtvEdge.getIcmSet()));//将这个存储一个备份
            rtvEdge.setIsChanged(true);
//            rtvEdge.getIcmSet().removeAll(icmSet);
            rtvEdge.removeIcmSetFromSet(icmSet);
            String port=rtvEdge.getPort();
            String edgeName=rtvEdge.getName();
            ValueNode valueNode=rtvEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode
            boolean isContainFlag=false;
            for(RelationToValueEdge rtvEdge_target : targetRelationNode.getRtvEdges()) {
                if (rtvEdge_target.getPort().equals(port) && rtvEdge_target.getName().equals(edgeName)
                        && rtvEdge_target.getEnder().getLoc()==valueNode.getLoc()) {

                    rtvEdge_target.setIcmSetPreCopy(new HashSet<Long>(rtvEdge_target.getIcmSet()));//将这个存储一个备份
                    rtvEdge_target.setIsChanged(true);
                    isContainFlag=true;//targetRelationNode中已经包含了该节点
//                    rtvEdge_target.getIcmSet().addAll(icmSet);
                    rtvEdge_target.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>(icmSet);
                RelationToValueEdge tmpRtvEdge=new RelationToValueEdge(port,edgeName,targetRelationNode,valueNode);
                tmpRtvEdge.setIcmSet(tTmpSet);
                tmpRtvEdge.setIsChanged(true);
//                tmpRtvEdge.setLoc(curLocId++);
                tmpRtvEdge.setIcmSetPreCopy(new HashSet<Long>());
                targetRelationNode.getRtvEdges().add(tmpRtvEdge);//我觉得这句话可以去掉的
                valueNode.getRtvEdges().add(tmpRtvEdge);//这句应该也可以去掉的
//                relationToVEdgeRepository.save(tmpRtvEdge);//relationToVEdgeRepository这个
            }
        }

        //对于sourceRelationNode的relationToClass部分
        for(RelationToClassEdge rtcEdge_target : targetRelationNode.getRtcEdges())
            rtcEdge_target.setIsChanged(false);

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            if(rtcEdge.getIcmSet().size()==0||!rtcEdge.getIcmSet().contains(oneIcmId)) {
                rtcEdge.setIsChanged(false);
                continue;
            }

            rtcEdge.setIcmSetPreCopy(new HashSet<>(rtcEdge.getIcmSet()));//将这个存储一个备份
            rtcEdge.setIsChanged(true);
//            rtcEdge.getIcmSet().removeAll(icmSet);
            rtcEdge.removeIcmSetFromSet(icmSet);
            String port=rtcEdge.getPort();
            String edgeName=rtcEdge.getName();
            ClassNode classNode=rtcEdge.getEnder();
            //下面要把该边上的该用户从sourceRelationNode迁移到targetRelationNode上去
            boolean isContainFlag=false;
            for(RelationToClassEdge rtcEdge_target : targetRelationNode.getRtcEdges()) {
                if(rtcEdge_target.getPort().equals(port) && rtcEdge_target.getName().equals(edgeName)
                        && rtcEdge_target.getEnder().getLoc()==classNode.getLoc()) {
                    rtcEdge_target.setIsChanged(true);
                    rtcEdge_target.setIcmSetPreCopy(new HashSet<>(rtcEdge_target.getIcmSet()));//将这个存储一个备份
                    isContainFlag=true;
//                    rtcEdge_target.getIcmSet().addAll(icmSet);
                    rtcEdge_target.addIcmSetFromSet(icmSet);
                    break;
                }else;
            }
            if(!isContainFlag) {//说明在上面的遍历过程中并没有找到这个边
                Set<Long> tTmpSet=new HashSet<>(icmSet);
                RelationToClassEdge tmpRtcEdge=new RelationToClassEdge(port,edgeName,targetRelationNode,classNode);
                tmpRtcEdge.setIcmSet(tTmpSet);
//                tmpRtcEdge.setLoc(curLocId++);
                tmpRtcEdge.setIsChanged(true);
                tmpRtcEdge.setIcmSetPreCopy(new HashSet<Long>());
                targetRelationNode.getRtcEdges().add(tmpRtcEdge);
                classNode.getRtcEdges().add(tmpRtcEdge);
            }
        }
    }

    private Double migrateRelationNodeWithMutual(Long icmId,int sourceRelationNodeListId,int targetRelationNodeListId) {
        Set<Long> curIdSet = new HashSet<>();
        curIdSet.add(icmId);

        double resVar = moveRelationNodeForMutualDetail(curIdSet, sourceRelationNodeListId, targetRelationNodeListId);
        if(Double.compare(resVar,0.0)<0 && Math.abs(resVar - 0.0)>0.000001) return resVar;
        else {
            //这就需要恢复程序了,其实就是再次互换位置
            moveRelationNodeForMutualDetail(curIdSet, sourceRelationNodeListId, targetRelationNodeListId);
            return resVar;
        }
    }

    private Double moveRelationNodeForMutualDetail(Set<Long> curIdSet,int sourceRelationNodeListId,int targetRelationNodeListId) {
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

        //这是第一步迁移操作,先把sourceRNode迁移到一个空节点上
        double var1 = 0x7FFFFFFF;
        int varLoc1 = -1;
        RelationNode tRelationNode=new RelationNode();
        tRelationNode.setLoc(relationNodeList.size());
        relationNodeList.add(tRelationNode);
        var1=simulateHandler.simulateMigrateForRelation(curIdSet, sourceRelationNode, tRelationNode, nodeSum,
                systemEntropy, true);
        varLoc1 = tRelationNode.getLoc();

        if(sourceRelationNode.getIcmSet().size()==1) this.nodeSum--;
        this.nodeSum++;//由于新增一个节点,因此需要添加该节点
        migrateRelationNodeForOneStep(curIdSet, sourceRelationNodeListId, varLoc1);

        systemEntropy += var1;
        reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId, varLoc1);
        removeNullEdgeForRelationNode(sourceRelationNodeListId);

        //下面是第二步迁移操作,把用户从targetCNode迁移到sourceCNode上去
        double var2 = 0x7FFFFFFF;
        boolean isNullNode = false;
        if(sourceRelationNode.getIcmSet().size()==0) isNullNode = true;
        var2=simulateHandler.simulateMigrateForRelation(curIdSet, targetRelationNode, sourceRelationNode, nodeSum,
                systemEntropy, isNullNode);
//        if(Double.compare(var2,Double.MAX_VALUE)==0) isFalseAppreance1 = true;
        if(targetRelationNode.getIcmSet().size()==1) this.nodeSum--;
        if(sourceRelationNode.getIcmSet().size()==0) this.nodeSum++;
        migrateRelationNodeForOneStep(curIdSet, targetRelationNodeListId, sourceRelationNodeListId);

        reComputeMigrateRelationNodeEntropy(targetRelationNodeListId, sourceRelationNodeListId);
        removeNullEdgeForRelationNode(targetRelationNodeListId);

        systemEntropy += var2;

        //下面是第三步迁移操作,把用户从tRelationNode迁移到targetCNode上去
        double var3 = 0x7FFFFFFF;
        isNullNode = false;
        if(targetRelationNode.getIcmSet().size()==0) isNullNode = true;
        var3=simulateHandler.simulateMigrateForRelation(curIdSet, tRelationNode, targetRelationNode, nodeSum, systemEntropy
                , isNullNode);
        this.nodeSum--;//去掉tRelationNode
        if(targetRelationNode.getIcmSet().size()==0) this.nodeSum++;
        migrateRelationNodeForOneStep(curIdSet, varLoc1, targetRelationNodeListId);

        reComputeMigrateRelationNodeEntropy(varLoc1, targetRelationNodeListId);
        removeNullEdgeForRelationNode(varLoc1);

        systemEntropy += var3;

        //删除空节点tRelationNode
        tRelationNode = null;
        relationNodeList.remove(varLoc1);

        double resVar = var1+var2+var3;
        return resVar;
    }

    public Double migrateRelationNodeNeedTwoStep(Long icmId,int sourceRelationNodeListId,int targetRelationNodeListId) {
        //首先是判断如果targetRelation没有当前icmId用户,将sourceRelation上的icmId迁移到targetClass上是否会减小熵值,如果会则执行该步骤,否则不执行
        //为targetRelation上的icmId用户找寻适合其迁移的最佳位置,判断这个迁移会造成多少熵值增加
        //如果增加的比迁移过来的减少的少,则进行迁移操作,否则不迁移
        RelationNode sourceRelationNode=relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode=relationNodeList.get(targetRelationNodeListId);

        Set<Long> icmIdSet = new HashSet<>();
        icmIdSet.add(icmId);

        //先判断能否相互迁移
        double mutualVar = migrateRelationNodeWithMutual(icmId,sourceRelationNodeListId,targetRelationNodeListId);
        if(Double.compare(mutualVar,0.0)<0 && Math.abs(mutualVar-0.0)>0.00001) return mutualVar;
        //然后再进行一般的两步迁移

        double minEntropyDown=0x7FFFFFFF;
        int minVarRNodeId=-1;  //我们希望找到的是引起targetRelation节点迁移到的目标节点熵值上升度最小的节点
        Boolean isTravseNUllNode=false;  //是否遍历空节点的情况

        //这里的目标是把target上的relation节点迁移到otherRelationNode上去,看看是否有效果
        List<Integer> thirdPartRNodeListIdSet = migrateUtil.findConRelationNodes(targetRelationNode,valueNodeList);
        boolean targetRNodeSettleStatus = targetRelationNode.getIsSettled();

        for(Integer tmpListId : thirdPartRNodeListIdSet) {
            RelationNode otherRelationNode = relationNodeList.get(tmpListId);
            if(otherRelationNode.getIcmSet().contains(icmId)) continue;
            boolean otherRNodeSettleStatus = otherRelationNode.getIsSettled();
            if(targetRNodeSettleStatus==true && otherRNodeSettleStatus==true) continue;
            boolean targetIsNullFlag = false;
            if(isTravseNUllNode && otherRelationNode.getIcmSet().size() == 0) continue;
            if(otherRelationNode.getIcmSet().size() == 0) {
                targetIsNullFlag=true;
                isTravseNUllNode=true;
            }
            double var=simulateHandler.simulateMigrateForRelation(icmIdSet, targetRelationNode, otherRelationNode,
                    nodeSum, systemEntropy, targetIsNullFlag);
            if(targetRelationNode.getLoc()==37 && otherRelationNode.getLoc()==7) {
                System.out.println("var: "+var);
                simulateHandler.simulateMigrateForRelation(icmIdSet, targetRelationNode, otherRelationNode, nodeSum,
                        systemEntropy, targetIsNullFlag);
            }
            if((Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001 )
                    || (Double.compare(var,minEntropyDown)==0
                    && targetRelationNode.getIcmSet().size()==1 && otherRelationNode.getIcmSet().size() != 0)) {
                minEntropyDown=var;
                minVarRNodeId=otherRelationNode.getLoc();
            }
        }

        boolean isUsedNullNode = false;
        if(!isTravseNUllNode && targetRelationNode.getIcmSet().size()!=1) {
            RelationNode tRelationNode=new RelationNode();
            tRelationNode.setLoc(relationNodeList.size());
            double var=simulateHandler.simulateMigrateForRelation(icmIdSet, targetRelationNode, tRelationNode, nodeSum,
                    systemEntropy, true);
            if(Double.compare(minEntropyDown,var)>0 && Math.abs(minEntropyDown - var) > 0.00001) {
                isUsedNullNode=true;
                minEntropyDown=var;
                relationNodeList.add(tRelationNode);
                minVarRNodeId=tRelationNode.getLoc();
            }else tRelationNode=null;
        }

        int recoverNodeSum=this.nodeSum;
        double recoverSystemEntropy = systemEntropy;

        if(minVarRNodeId!=-1) {//说明确实找到了可以让该节点熵值下降的通道

//            printMigrateValue(targetRelationNode,relationNodeList.get(minVarRNodeId));

            if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
            if(relationNodeList.get(minVarRNodeId).getIcmSet().size()==0) this.nodeSum++;

            //将targetRelation上的icmId正式迁移到minVarRNodeId节点上去
            migrateRelationNodeForOneStep(icmIdSet, targetRelationNodeListId, minVarRNodeId);
            //如果需要恢复到迁移前,则在下面启动恢复过程

            systemEntropy += minEntropyDown;
            reComputeMigrateRelationNodeEntropy(targetRelationNodeListId,minVarRNodeId);
//            printMigrateValue(targetRelationNode,relationNodeList.get(minVarRNodeId));//这是用来验证的
        }else return 0.0;
        //上面这个migrateRelationNodeForOneStep实实在在的把targetRelationNode上的icmId迁移到了minVarRNodeId对应节点上

        boolean secondStepFlag=false;
        if(targetRelationNode.getIcmSet().size()==0) secondStepFlag=true;
        double simVar=simulateHandler.simulateMigrateForRelation(icmIdSet, sourceRelationNode, targetRelationNode,
                nodeSum, systemEntropy, secondStepFlag);
        if((Double.compare(simVar,0.0)>=0 && Math.abs(simVar - 0.0) > 0.00001) || Math.abs(simVar - 0.0)<0.00001 ) {
            //说明这步迁移是没有意义的,我们接下来判断刚才的迁移是否需要复原
            if(Double.compare(minEntropyDown,0.0)>0 ||
                    ((Double.compare(minEntropyDown,0.0)==0 || Math.abs(minEntropyDown - 0.0)<0.00001) && !(targetRelationNode.getIcmSet().size()==0
                            && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                //需要复原之前的迁移
                recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                recoverEdgeStateForRelationNode(targetRelationNodeListId);
                recoverEdgeStateForRelationNode(minVarRNodeId);
                recoverMigrateRelationNode(targetRelationNodeListId,minVarRNodeId);
                removeRecoverRelationNullNode(minVarRNodeId);//去除这边多余的0边
                systemEntropy = recoverSystemEntropy;
                this.nodeSum=recoverNodeSum;
            }else {
                isStable=false;
                setSettleValueForRelationMigrate(targetRelationNodeListId, minVarRNodeId);//设置false
                removeNullEdgeForRelationNode(targetRelationNodeListId);
                System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                        targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId+" ,减小熵值为: "+minEntropyDown);
            }//不需要复原
        }else {
            //说明当前的迁移是有意义的,但是我们还是需要判断这次两步迁移是否会造成系统熵值上升
            double tmpSimVar=-simVar;//将负值先转换为正的
            if(Double.compare(minEntropyDown,0.0)>=0 ||
                    (Double.compare(minEntropyDown,0.0)==0 && !(targetRelationNode.getIcmSet().size()==0
                            && relationNodeList.get(minVarRNodeId).getIcmSet().size()>1))) {
                double resSimVar=tmpSimVar-minEntropyDown;
                if(Double.compare(resSimVar,0.0)>=0 && Math.abs(resSimVar-0.0)>0.00001) {//说明迁移后系统熵值减小,这是成功的
                    if(relationNodeList.get(sourceRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
                    if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==0) this.nodeSum++;
                    setSettleValueForRelationMigrate(targetRelationNodeListId, minVarRNodeId);//设置false
                    removeNullEdgeForRelationNode(targetRelationNodeListId);
                    migrateRelationNodeForOneStep(icmIdSet, sourceRelationNodeListId, targetRelationNodeListId);
                    reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeListId);
                    setSettleValueForRelationMigrate(sourceRelationNodeListId, targetRelationNodeListId);//设置false
                    removeNullEdgeForRelationNode(sourceRelationNodeListId);
                    systemEntropy += simVar;
                    isStable=false;
                    System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                            targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId);
                    System.out.println("首步迁移的熵值下降为: "+minEntropyDown);
                    System.out.println("发生两步迁移操作:次步成功,用户编号:"+icmId+" ,sourceRelationNodeListId为:"+
                            sourceRelationNodeListId+ " ,targetRelationNodeListId为:"+targetRelationNodeListId);
                    System.out.println("次步迁移的熵值下降为: "+simVar);
                }else {//resSimVar<0.0说明系统熵值总体上升了,因此必须回复全部初始数据
                    recoverMigrateStateForRelationNode(icmId,targetRelationNodeListId,minVarRNodeId,isUsedNullNode);//还原原有的节点格局
                    recoverEdgeStateForRelationNode(targetRelationNodeListId);
                    recoverEdgeStateForRelationNode(minVarRNodeId);
                    recoverMigrateRelationNode(targetRelationNodeListId,minVarRNodeId);
                    removeRecoverRelationNullNode(minVarRNodeId);//去除这边多余的0边
                    systemEntropy = recoverSystemEntropy;
                    this.nodeSum=recoverNodeSum;
                }
            }else {
                //成功,我们需要将souceRelation上的icmId用户迁移到targetRelation上去
                if(relationNodeList.get(sourceRelationNodeListId).getIcmSet().size()==1) this.nodeSum--;
                if(relationNodeList.get(targetRelationNodeListId).getIcmSet().size()==0) this.nodeSum++;
                setSettleValueForRelationMigrate(targetRelationNodeListId, minVarRNodeId);//设置false
                removeNullEdgeForRelationNode(targetRelationNodeListId);
                migrateRelationNodeForOneStep(icmIdSet, sourceRelationNodeListId, targetRelationNodeListId);
                reComputeMigrateRelationNodeEntropy(sourceRelationNodeListId,targetRelationNodeListId);
                setSettleValueForRelationMigrate(sourceRelationNodeListId, targetRelationNodeListId);//设置false
                removeNullEdgeForRelationNode(sourceRelationNodeListId);
                systemEntropy += simVar;
                isStable=false;
                System.out.println("发生两步迁移操作:首步成功,用户编号:"+icmId+" ,targetRelationNodeListId为:"+
                        targetRelationNodeListId+ " ,minVarRNodeId为:"+minVarRNodeId+" ,减小熵值为: "+minEntropyDown);
                System.out.println("发生两步迁移操作:次步成功,用户编号:"+icmId+" ,sourceRelationNodeListId为:"+
                        sourceRelationNodeListId+ " ,targetRelationNodeListId为:"+targetRelationNodeListId);
            }
        }
        return simVar+minEntropyDown;
    }


    /**
     * 获取一组不重复的随机序列,长度为总长,元素范围为0~(class+relation)-1
     * @return 随机数(范围在0~class和relation节点总数-1)
     */
    public int[] randomValue() {
        int sum=classNodeList.size()+relationNodeList.size();
        int[] randList = new int[sum];
        for(int i=0;i<sum;i++) {
            randList[i]=i;
        }//填充了初始的randList列表

        Random random=new Random();
        int x=0,tmp=0;

        for(int i=sum-1;i>0;i--) {
            int curTarget=Math.abs(random.nextInt()%sum);
            tmp=randList[i];
            randList[i]=randList[curTarget];
            randList[curTarget]=tmp;
        }
        return randList;
    }

    private void reComputeMigrateClassNodeEntropy(int sourceClassNodeListId,int targetClassNodeListId) {
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);
        ClassNode targetClassNode = classNodeList.get(targetClassNodeListId);

        Set<Integer> relationNodeListIdSet = new HashSet<>();//防止relationNode节点重复set
        Set<Integer> valueNodeListIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            RelationNode relationNode = rtcEdge.getStarter();
            if(!relationNodeListIdSet.contains(relationNode.getLoc())) {
                relationNode.setPostBiEntropyValue(relationNode.getBiEntropyValue());
                relationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode
                        (relationNode.getRtcEdges(),relationNode.getRtvEdges()),relationNode));
                relationNodeListIdSet.add(relationNode.getLoc());
            }else continue;
        }

        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges())  {
            ValueNode valueNode = ctvEdge.getEnder();
            if(!valueNodeListIdSet.contains(valueNode.getLoc())) {
                valueNode.setPostBiEntropyValue(valueNode.getBiEntropyValue());
//                valueNode.setBiEntropyValue(entropyHandler.computeMapEntropy(entropyHandler.getMapForValueNode(
//                        valueNode.getCtvEdges(),valueNode.getRtvEdges()),nodeSum)/nodeSum);
                valueNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForValueNode(
                        valueNode.getCtvEdges(),valueNode.getRtvEdges()),valueNode));
                valueNodeListIdSet.add(valueNode.getLoc());
            }else continue;
        }

        sourceClassNode.setPostBiEntropyValue(sourceClassNode.getBiEntropyValue());
//        sourceClassNode.setBiEntropyValue(entropyHandler.computeMapEntropy(entropyHandler.getMapForClassNode(
//                sourceClassNode.getCtvEdges(),sourceClassNode.getRtcEdges()),nodeSum)/nodeSum);
        sourceClassNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode(
                sourceClassNode.getCtvEdges(),sourceClassNode.getRtcEdges()),sourceClassNode));

        targetClassNode.setPostBiEntropyValue(targetClassNode.getBiEntropyValue());
        targetClassNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode(
                targetClassNode.getCtvEdges(),targetClassNode.getRtcEdges()),targetClassNode));
    }

    private void reComputeMigrateRelationNodeEntropy(int sourceRelationNodeListId,int targetRelationNodeListId) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);
        RelationNode targetRelationNode = relationNodeList.get(targetRelationNodeListId);

        Set<Integer> classNodeListIdSet = new HashSet<>();//防止classNode节点重复set
        Set<Integer> valueNodeListIdSet = new HashSet<>();//防止classNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode classNode = rtcEdge.getEnder();
            if(!classNodeListIdSet.contains(classNode.getLoc())) {
                classNode.setPostBiEntropyValue(classNode.getBiEntropyValue());
                classNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForClassNode
                        (classNode.getCtvEdges(),classNode.getRtcEdges()),classNode));
                classNodeListIdSet.add(classNode.getLoc());
            }else continue;
        }

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode valueNode = rtvEdge.getEnder();
            if(!valueNodeListIdSet.contains(valueNode.getLoc())) {
                valueNode.setPostBiEntropyValue(valueNode.getBiEntropyValue());
                valueNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForValueNode(
                        valueNode.getCtvEdges(),valueNode.getRtvEdges()),valueNode));
                valueNodeListIdSet.add(valueNode.getLoc());
            }else continue;
        }

        sourceRelationNode.setPostBiEntropyValue(sourceRelationNode.getBiEntropyValue());
        sourceRelationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode
                (sourceRelationNode.getRtcEdges(),sourceRelationNode.getRtvEdges()),sourceRelationNode));

        targetRelationNode.setPostBiEntropyValue(targetRelationNode.getBiEntropyValue());
        targetRelationNode.setBiEntropyValue(entropyHandler.computeMapBiEntropy(entropyHandler.getMapForRelationNode(
                targetRelationNode.getRtcEdges(),targetRelationNode.getRtvEdges()),targetRelationNode));
    }

    private void recoverMigrateClassNode(int sourceClassNodeListId,int targetClassNodeListId) {
        ClassNode sourceClassNode = classNodeList.get(sourceClassNodeListId);

        Set<Integer> relationNodeListIdSet = new HashSet<>();//防止relationNode节点重复set
        Set<Integer> valueNodeListIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceClassNode.getRtcEdges()) {
            RelationNode relationNode = rtcEdge.getStarter();
            if(!relationNodeListIdSet.contains(relationNode.getLoc())) {
                relationNode.setBiEntropyValue(relationNode.getPostBiEntropyValue());
                relationNodeListIdSet.add(relationNode.getLoc());
            }else continue;
        }

        for(ClassToValueEdge ctvEdge : sourceClassNode.getCtvEdges())  {
            ValueNode valueNode = ctvEdge.getEnder();
            if(!valueNodeListIdSet.contains(valueNode.getLoc())) {
                valueNode.setBiEntropyValue(valueNode.getPostBiEntropyValue());
                valueNodeListIdSet.add(valueNode.getLoc());
            }else continue;
        }

        sourceClassNode.setBiEntropyValue(sourceClassNode.getPostBiEntropyValue());
        if(targetClassNodeListId<classNodeList.size()) {
            ClassNode targetClassNode = classNodeList.get(targetClassNodeListId);
            targetClassNode.setBiEntropyValue(targetClassNode.getPostBiEntropyValue());
        }
    }

    private void recoverMigrateRelationNode(int sourceRelationNodeListId,int targetRelationNodeListId) {
        RelationNode sourceRelationNode = relationNodeList.get(sourceRelationNodeListId);

        Set<Integer> classNodeListIdSet = new HashSet<>();//防止classNode节点重复set
        Set<Integer> valueNodeListIdSet = new HashSet<>();//防止valueNode节点重复set

        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode classNode = rtcEdge.getEnder();
            if(!classNodeListIdSet.contains(classNode.getLoc()))  {
                classNode.setBiEntropyValue(classNode.getPostBiEntropyValue());
                classNodeListIdSet.add(classNode.getLoc());
            }else continue;
        }

        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode valueNode = rtvEdge.getEnder();
            if(!valueNodeListIdSet.contains(valueNode.getLoc())) {
                valueNode.setBiEntropyValue(valueNode.getPostBiEntropyValue());
                valueNodeListIdSet.add(valueNode.getLoc());
            }else continue;
        }

        sourceRelationNode.setBiEntropyValue(sourceRelationNode.getPostBiEntropyValue());

        if(targetRelationNodeListId<relationNodeList.size()) {
            RelationNode targetRelationNode = relationNodeList.get(targetRelationNodeListId);
            targetRelationNode.setBiEntropyValue(targetRelationNode.getPostBiEntropyValue());
        }
    }

    /**
     *这是用于两步迁移时的恢复
     * @param icmId
     * @param targetClassNodeListId
     * @param minVarCNodeListId
     */
    private void recoverMigrateStateForClassNode(Long icmId,int targetClassNodeListId,
                                                 int minVarCNodeListId,boolean isUsedNullNode) {
        ClassNode sourceCNode = classNodeList.get(targetClassNodeListId);
//        sourceCNode.getIcmSet().add(icmId);
        sourceCNode.addIcmId(icmId);
        if(!isUsedNullNode) {
            ClassNode targetCNode = classNodeList.get(minVarCNodeListId);
//            targetCNode.getIcmSet().remove(icmId);
            targetCNode.removeIcmId(icmId);
        }else {
            //这个不是仅仅删除节点这么简单,还要删除边,以及边另一端的节点
            ClassNode tmpCNode =classNodeList.get(minVarCNodeListId);
            for(ClassToValueEdge ctvEdge : tmpCNode.getCtvEdges()) {
                ctvEdge.getEnder().getCtvEdges().remove(ctvEdge);
            }
            for(RelationToClassEdge rtcEdge : tmpCNode.getRtcEdges()) {
                rtcEdge.getStarter().getRtcEdges().remove(rtcEdge);
            }
            classNodeList.remove(classNodeList.size()-1);
        }
    }

    private void removeRecoverClassNullNode(int minVarCNodeListId) {
        if(minVarCNodeListId >= classNodeList.size()) return;
        ClassNode targetCNode = classNodeList.get(minVarCNodeListId);
        Set<RelationToClassEdge> rtcList = new HashSet<>(targetCNode.getRtcEdges());
        Set<ClassToValueEdge> ctvList = new HashSet<>(targetCNode.getCtvEdges());
        for(RelationToClassEdge rtcEdge : rtcList)
            if(rtcEdge.getIcmSet().size()==0) {
                rtcEdge.getStarter().getRtcEdges().remove(rtcEdge);
                targetCNode.getRtcEdges().remove(rtcEdge);
            }
        for(ClassToValueEdge ctvEdge : ctvList)
            if(ctvEdge.getIcmSet().size()==0) {
                ctvEdge.getEnder().getCtvEdges().remove(ctvEdge);
                targetCNode.getCtvEdges().remove(ctvEdge);
            }
    }

    private void recoverMigrateStateForRelationNode(Long icmId,int targetRelationNodeListId,
                                                    int minVarRNodeListId,boolean isUsedNullNode) {
        RelationNode relationRNode = relationNodeList.get(targetRelationNodeListId);
//        relationRNode.getIcmSet().add(icmId);
        relationRNode.addIcmId(icmId);

        if(!isUsedNullNode) {
            RelationNode targetRNode = relationNodeList.get(minVarRNodeListId);
//            targetRNode.getIcmSet().remove(icmId);
            targetRNode.removeIcmId(icmId);
        }else {
            RelationNode tmpRNode =relationNodeList.get(minVarRNodeListId);
            for(RelationToValueEdge rtvEdge : tmpRNode.getRtvEdges()) {
                rtvEdge.getEnder().getRtvEdges().remove(rtvEdge);
            }
            for(RelationToClassEdge rtcEdge : tmpRNode.getRtcEdges()) {
                rtcEdge.getEnder().getRtcEdges().remove(rtcEdge);
            }
            relationNodeList.remove(relationNodeList.size()-1);
        }
    }

    private void removeRecoverRelationNullNode(int minVarRNodeListId) {
        if(minVarRNodeListId >= relationNodeList.size()) return;
        RelationNode targetRNode = relationNodeList.get(minVarRNodeListId);
        Set<RelationToClassEdge> rtcList = new HashSet<>(targetRNode.getRtcEdges());
        Set<RelationToValueEdge> rtvList = new HashSet<>(targetRNode.getRtvEdges());
        for(RelationToClassEdge rtcEdge : rtcList)
            if(rtcEdge.getIcmSet().size()==0) {
                rtcEdge.getEnder().getRtcEdges().remove(rtcEdge);
                targetRNode.getRtcEdges().remove(rtcEdge);
            }
        for(RelationToValueEdge rtvEdge : rtvList)
            if(rtvEdge.getIcmSet().size()==0) {
                rtvEdge.getEnder().getRtvEdges().remove(rtvEdge);
                targetRNode.getRtvEdges().remove(rtvEdge);
            }
    }

    private void recoverEdgeStateForClassNode(int classNodeListId) {
        if(classNodeListId >= classNodeList.size()) return;
        ClassNode cNode = classNodeList.get(classNodeListId);
        for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmSet(new HashSet<Long>(rtcEdge.getIcmSetPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
            if(!ctvEdge.isChanged()) continue;
            else {
                ctvEdge.setIcmSet(new HashSet<Long>(ctvEdge.getIcmSetPreCopy()));
                ctvEdge.setIsChanged(false);
            }
        }
    }

    private void  recoverEdgeStateForRelationNode(int relationNodeListId) {
        if(relationNodeListId >= relationNodeList.size()) return;
        RelationNode rNode = relationNodeList.get(relationNodeListId);
        for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
            if(!rtcEdge.isChanged()) continue;
            else {
                rtcEdge.setIcmSet(new HashSet<Long>(rtcEdge.getIcmSetPreCopy()));
                rtcEdge.setIsChanged(false);
            }
        }

        for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
            if(!rtvEdge.isChanged()) continue;
            else {
                rtvEdge.setIcmSet(new HashSet<Long>(rtvEdge.getIcmSetPreCopy()));
                rtvEdge.setIsChanged(false);
            }
        }
    }

    protected void removeNullEdgeForClassNode(int sourceCNodeListId) {
        ClassNode sourceCNode = classNodeList.get(sourceCNodeListId);

        List<RelationToClassEdge> rtcList = new ArrayList<>(sourceCNode.getRtcEdges());
        List<ClassToValueEdge> ctvList = new ArrayList<>(sourceCNode.getCtvEdges());

        for(RelationToClassEdge rtcEdge : rtcList) {
            if(rtcEdge.getIcmSet().size() == 0) {
                RelationNode relationNode = rtcEdge.getStarter();
                relationNode.getRtcEdges().remove(rtcEdge);
                sourceCNode.getRtcEdges().remove(rtcEdge);
            }
        }
        for(ClassToValueEdge ctvEdge : ctvList) {
            if(ctvEdge.getIcmSet().size() == 0) {
                ValueNode valueNode = ctvEdge.getEnder();
                valueNode.getCtvEdges().remove(ctvEdge);
                sourceCNode.getCtvEdges().remove(ctvEdge);
            }
        }
    }

    protected void removeNullEdgeForRelationNode(int sourceRNodeListId) {
        RelationNode sourceRNode = relationNodeList.get(sourceRNodeListId);

        List<RelationToClassEdge> rtcList = new ArrayList<>(sourceRNode.getRtcEdges());
        List<RelationToValueEdge> rtvList = new ArrayList<>(sourceRNode.getRtvEdges());

        for(RelationToClassEdge rtcEdge : rtcList) {
            if(rtcEdge.getIcmSet().size() == 0) {
                ClassNode classNode = rtcEdge.getEnder();
                classNode.getRtcEdges().remove(rtcEdge);
                sourceRNode.getRtcEdges().remove(rtcEdge);
            }
        }

        for(RelationToValueEdge rtvEdge : rtvList) {
            if(rtvEdge.getIcmSet().size() == 0) {
                ValueNode valueNode = rtvEdge.getEnder();
                valueNode.getRtvEdges().remove(rtvEdge);
                sourceRNode.getRtvEdges().remove(rtvEdge);
            }
        }
    }





    /******************************************华丽分界线**********************************************/
// /////////////下面这段代码主要是用于测试 验证程序是否有bug和检测结果的

    /**
     * 找出一个最后的概念模型
     */
    private void findFinalConceptModel() {
        Set<Integer> finalCNodeSet = selectFinalClassNode();//获取到所有的最终的concept概念
        Set<Integer> finalRNodeSet = selectFinalRelationNode(finalCNodeSet);//获取到所有的最终的relation概念

        for(int curCLoc : finalCNodeSet) {
            ClassNode cNode = classNodeList.get(curCLoc);
            String cNodeName = "";
            int max=0;
            for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                if(ctvEdge.getIcmSet().size()>max) {
                    cNodeName = ctvEdge.getEnder().getName();
                    max = ctvEdge.getIcmSet().size();
                }
            }
            System.out.println("classnode id 为: " + cNode.getLoc() + "概念名为: " + cNodeName);
        }

        for(int curRLoc : finalRNodeSet) {
            RelationNode rNode = relationNodeList.get(curRLoc);

            String relationType = "";
            int typeMax = 0;

            Map<Integer,Integer> roleMap = new HashMap<>();
            Map<Integer,String> rolePortMap = new HashMap<>();
            Map<Integer,Integer> multiMap = new HashMap<>();
            Map<Integer,String> multiPortMap = new HashMap<>();
            Map<Integer,Integer> classMap = new HashMap<>();
            Map<Integer,String> classPortMap = new HashMap<>();
            for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
                ValueNode curVNode = rtvEdge.getEnder();
                int vLoc = curVNode.getLoc();
                int edgeSize = rtvEdge.getIcmSet().size();
                String edgeName = rtvEdge.getName();
                String port = rtvEdge.getPort();
                if(edgeName.equals("role")) {

                    if(roleMap.containsKey(vLoc)) {
                        roleMap.put(vLoc,roleMap.get(vLoc)+edgeSize);
                    }else {
                        roleMap.put(vLoc,edgeSize);
                        rolePortMap.put(vLoc,port);
                    }
                }else if(edgeName.equals("multi")) {
                    if(multiMap.containsKey(vLoc)) {
                        multiMap.put(vLoc,multiMap.get(vLoc)+edgeSize);
                    }else {
                        multiMap.put(vLoc,edgeSize);
                        multiPortMap.put(vLoc,port);
                    }
                }else {
                    if(edgeSize>typeMax) {
                        typeMax = edgeSize;
                        relationType = edgeName;
                    }
                }
            }

            for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
                int edgeSize = rtcEdge.getIcmSet().size();
                int cLoc = rtcEdge.getEnder().getLoc();
                String port = rtcEdge.getPort();
                if(classMap.containsKey(cLoc)) {
                    classMap.put(cLoc,classMap.get(cLoc)+edgeSize);
                }else {
                    classMap.put(cLoc,edgeSize);
                    classPortMap.put(cLoc,port);
                }
            }

            List<SelectNode> roleList = new ArrayList<>();
            List<SelectNode> multiList = new ArrayList<>();
            List<SelectNode> classList = new ArrayList<>();
            for(int key : roleMap.keySet()) {
                SelectNode sn = new SelectNode(key,roleMap.get(key),rolePortMap.get(key));
                roleList.add(sn);
            }

            for(int key : multiMap.keySet()) {
                SelectNode sn = new SelectNode(key,multiMap.get(key),multiPortMap.get(key));
                multiList.add(sn);
            }

            for(int key : classMap.keySet()) {
                SelectNode sn = new SelectNode(key,classMap.get(key),classPortMap.get(key));
                classList.add(sn);
            }

            Collections.sort(roleList, new Comparator<SelectNode>() {
                @Override
                public int compare(SelectNode o1, SelectNode o2) {
                    return o2.number - o1.number;
                }
            });

            Collections.sort(multiList, new Comparator<SelectNode>() {
                @Override
                public int compare(SelectNode o1, SelectNode o2) {
                    return o2.number - o1.number;
                }
            });

            Collections.sort(classList, new Comparator<SelectNode>() {
                @Override
                public int compare(SelectNode o1, SelectNode o2) {
                    return o2.number - o1.number;
                }
            });

            int e0ClassLoc = -1;
            String e0RoleName = "";
            String e0MultiName = "";
            int e1ClassLoc = -1;
            String e1RoleName = "";
            String e1MultiName = "";

            int index=0;
            while(true) {
                SelectNode sn = classList.get(index);
                if(e0ClassLoc==-1 && (sn.port.equals("E0")||sn.port.equals("e0"))) {
                    e0ClassLoc = sn.loc;
                }else if(e1ClassLoc==-1 && (sn.port.equals("E1")||sn.port.equals("e1"))) {
                    e1ClassLoc = sn.loc;
                }
                if(e0ClassLoc!=-1 && e1ClassLoc!=-1) break;
                index++;
            }

            //如果两端不在findCNodeSet中,则忽略该relationNode
            if(!finalCNodeSet.contains(e0ClassLoc) || !finalCNodeSet.contains(e1ClassLoc)) continue;
            index=0;

            while(true) {
                SelectNode sn = roleList.get(index);
                if(e0RoleName.equals("") && (sn.port.equals("E0")||sn.port.equals("e0"))) {
                    e0RoleName = valueNodeList.get(sn.loc).getName();
                }else if(e1RoleName.equals("") && (sn.port.equals("E1")||sn.port.equals("e1"))) {
                    e1RoleName = valueNodeList.get(sn.loc).getName();
                }
                if((!e0RoleName.equals("") && !e1RoleName.equals("")) || index == roleList.size()-1) break;
                index++;
            }
            index=0;
            while(true) {
                SelectNode sn = multiList.get(index);
                if(e0MultiName.equals("") && (sn.port.equals("E0")||sn.port.equals("e0"))) {
                    e0MultiName = valueNodeList.get(sn.loc).getName();
                }else if(e1MultiName.equals("") && (sn.port.equals("E1")||sn.port.equals("e1"))) {
                    e1MultiName = valueNodeList.get(sn.loc).getName();
                }
                if((!e0MultiName.equals("") && !e1MultiName.equals("")) || index == multiList.size()-1) break;
                index++;
            }

            System.out.println("关系类型: " + relationType + " ,关系节点编号为: " + rNode.getLoc() +
                    " ,两端的类节点编号为: e0: " + e0ClassLoc +" ,e1: " + e1ClassLoc + " ,两端的role为: e0: "
                    + e0RoleName + " ,e1: " + e1RoleName + " ,两端的multi为: e0: " +
                    e0MultiName + " ,e1: " + e1MultiName + " .");
        }
    }

    private class SelectNode {
        int loc;
        int number;
        String port;

        public SelectNode(int loc,int number,String port) {
            this.loc = loc;
            this.port = port;
            this.number = number;
        }
    }

    private Set<Integer> selectFinalRelationNode(Set<Integer> finalCNodeSet) {
        Set<Integer> finalRNodeSet = new HashSet<>();
        Iterator<Integer> cNodeiter = finalCNodeSet.iterator();
        while(cNodeiter.hasNext()) {
            ClassNode cNode = classNodeList.get(cNodeiter.next());
            //找寻对应的relationNode
            for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
                String edgePort = rtcEdge.getPort();
                RelationNode rNode = rtcEdge.getStarter();//获得了对应的relationNode,但是不确定这个是否可以加入到finalRNodeSet中,还需要更进一步的判断
                for(RelationToClassEdge innerRtcEdge : rNode.getRtcEdges()) {
                    String innerEdgePort = innerRtcEdge.getPort();
                    if(edgePort.equals(innerEdgePort)) continue;//如果端口相同,则不考虑
                    int innerCNodeLocId = innerRtcEdge.getEnder().getLoc();
                    if(finalCNodeSet.contains(innerCNodeLocId) && innerCNodeLocId != cNode.getLoc()) {
                        finalRNodeSet.add(rNode.getLoc());
                        break;//加入该relationNode后,跳出循环
                    }
                }
            }
        }
        //这样就把所有的应该要有的relationNode包含进去了
        return finalRNodeSet;
    }
    /**
     * 这个是用来找出最终模型中classNode的函数
     * @return 返回概念节点的集合(loc集合)
     */
    private Set<Integer> selectFinalClassNode() {
        Set<Integer> resCNodeSet = new HashSet<>();

        int classNum = classNodeList.size();
        Map<Integer,Set<Integer>> cNodeRefUserMap = new HashMap<>();
        int averageCNum = classNum/getUerNum(cNodeRefUserMap); //这个是平均概念数,我的目标就是提取出这么多的概念
        int leftCNum = averageCNum;//表示当前需要收集多少个概念
        List<Integer> refNumList = new ArrayList<>(cNodeRefUserMap.keySet());
        Collections.sort(refNumList, new Comparator<Integer>() {
            @Override
            public int compare(Integer o1, Integer o2) {
                return o2.compareTo(o1);
            }
        });
        //这样refNumSet中的元素就是有序的,第一个为最大的引用用户数的集合
        for(int curRefNum : refNumList) {
            Set<Integer> cNodeSet = cNodeRefUserMap.get(curRefNum);
            if(cNodeSet.size()>leftCNum) {
                //在这里,我们确定cNodeSet中哪些节点和当前的resCNodeSet中每个节点用户的交集都不为空
                Set<Long> conUserSet = new HashSet<>();//这个是所有resCNodeSet中的用户交集
                getConUserSet(conUserSet,resCNodeSet);//conUserSet可能为空
                if(conUserSet.size()>0)  {
                    Iterator<Integer> iter = cNodeSet.iterator();
                    while(iter.hasNext() && leftCNum>0) {
                        ClassNode curCNode = classNodeList.get(iter.next());
                        Set<Long> curIcmSet = new HashSet<>(curCNode.getIcmSet());
                        curIcmSet.retainAll(conUserSet);
                        if(curIcmSet.size()>0) {
                            resCNodeSet.add(curCNode.getLoc());
                            leftCNum--;
                        }
                    }//遍历完了,如果此时leftCNum不为0,我们也将他置为0
                }else ;//为空则不再添加新节点了,默认不再剩余节点
                leftCNum = 0;
            }else {
                leftCNum -= cNodeSet.size();
                resCNodeSet.addAll(new HashSet<Integer>(cNodeSet));
            }
            if(leftCNum==0) break;
        }
        return resCNodeSet;
    }

    /**
     * 获取所有当前resCNodeSet的用户交集,存入到conUserSet中
     * @param conUserSet
     * @param resCNodeSet
     */
    private void getConUserSet(Set<Long> conUserSet,Set<Integer> resCNodeSet) {
        Iterator<Integer> iter = resCNodeSet.iterator();
        boolean isNew = true;
        while(iter.hasNext()) {
            int curCNodeListId = iter.next();
            ClassNode cNode = classNodeList.get(curCNodeListId);
            if(isNew) {
                conUserSet = new HashSet<>(cNode.getIcmSet());
                isNew = false;
            }else conUserSet.retainAll(cNode.getIcmSet());
        }
    }
    /**
     * @param cNodeRefUserMap 这个是key为引用用户数,value为list,每个元素为对应节点
     * @return 参与建模的用户数
     */
    private int getUerNum(Map<Integer,Set<Integer>> cNodeRefUserMap) {
        int uSize = 0;
        int cNum = classNodeList.size();
        Set<Long> uNumSet = new HashSet<>();
        for(int i=0;i<cNum;i++) {
            ClassNode cNode = classNodeList.get(i);
            if(cNode.getIcmSet().size()==0) continue;
            int curUNum = cNode.getIcmSet().size();
            if(cNodeRefUserMap.containsKey(curUNum)) {
                cNodeRefUserMap.get(curUNum).add(cNode.getLoc());
            }else {
                Set<Integer> list = new HashSet<>();
                list.add(cNode.getLoc());
                cNodeRefUserMap.put(curUNum,list);
            }
            uNumSet.addAll(new HashSet<>(classNodeList.get(i).getIcmSet()));
        }
        return uNumSet.size();
    }

    private void printMigrateValue(RelationNode sourceRelationNode,RelationNode targetRelationNode) {
        for(RelationToClassEdge rtcEdge : sourceRelationNode.getRtcEdges()) {
            ClassNode cNode = rtcEdge.getEnder();
            System.out.print("cNodeId: "+cNode.getLoc()+",熵值: "+cNode.getBiEntropyValue()+",");
        }
        System.out.println();
        for(RelationToValueEdge rtvEdge : sourceRelationNode.getRtvEdges()) {
            ValueNode vNode = rtvEdge.getEnder();
            System.out.print("vNodeId: "+vNode.getLoc()+",熵值: "+vNode.getBiEntropyValue()+",");
        }

        System.out.println("source熵值为: "+sourceRelationNode.getBiEntropyValue()+" ,target熵值为: "+
                targetRelationNode.getBiEntropyValue());
    }

    private double scanToComputeSystemEntropy() {
        double testBiEntropy = 0.0;
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode classNode = classNodeList.get(i);
            testBiEntropy += classNode.getBiEntropyValue();
//            if(Math.abs(classNode.getBiEntropyValue()-0.0)>0.00001) {
//                System.out.println("classNode的Listid为: "+classNode.getLoc());
//            }
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode relationNode = relationNodeList.get(i);
            testBiEntropy += relationNode.getBiEntropyValue();
//            if (Math.abs(relationNode.getBiEntropyValue() - 0.0) > 0.00001) {
//                System.out.println("relationNode的Listid为: " + relationNode.getLoc());
//            }
        }
        for(int i=0;i<valueNodeList.size();i++) {
            ValueNode valueNode = valueNodeList.get(i);
            testBiEntropy +=valueNode.getBiEntropyValue();
//            if (Math.abs(valueNode.getBiEntropyValue() - 0.0) > 0.00001) {
//                System.out.println("valueNode的名字为: " + valueNode.getName());
//            }
        }
        return testBiEntropy * nodeSum;
    }

    private void scanToFindBug() {
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            int icmSum=cNode.getIcmSet().size();
            for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                if(ctvEdge.getIcmSet().size()>icmSum) {
                    System.out.println("11111111");
                }
                if(ctvEdge.getIcmSet().size() == 0) {
                    System.out.println("11111111");
                }
            }

            for(RelationToClassEdge rtcEdge : cNode.getRtcEdges()) {
                if(rtcEdge.getIcmSet().size()>icmSum) {
                    System.out.println("222222222");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
                if(rtcEdge.getIcmSet().size() == 0) {
                    System.out.println("222222222");
                }
            }
        }

        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode = relationNodeList.get(i);
            int icmSum=rNode.getIcmSet().size();
            for(RelationToValueEdge rtvEdge : rNode.getRtvEdges()) {
                if(rtvEdge.getIcmSet().size()>icmSum) {
                    System.out.println("3333333333");
                }
                if(rtvEdge.getIcmSet().size()==0) {
                    System.out.println("3333333333");
                }
            }

            for(RelationToClassEdge rtcEdge : rNode.getRtcEdges()) {
                if(rtcEdge.getIcmSet().size()>icmSum) {
                    System.out.println("44444444444");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
                if(rtcEdge.getIcmSet().size()==0) {
                    System.out.println("44444444444");
                    System.out.println("relation: "+rtcEdge.getStarter().getLoc());
                }
            }
        }

        for(int i=0;i<valueNodeList.size();i++) {
            ValueNode vNode = valueNodeList.get(i);
            int icmSum = vNode.getIcmSet().size();
            for(ClassToValueEdge ctvEdge : vNode.getCtvEdges()) {
                if(ctvEdge.getIcmSet().size() > icmSum) {
                    System.out.println("55555555555");
                    System.out.println("classNode loc: "+ctvEdge.getStarter().getLoc());
                }
                if(ctvEdge.getIcmSet().size() == 0) {
                    System.out.println("55555555555");
                    System.out.println("classNode loc: "+ctvEdge.getStarter().getLoc());
                }
            }
            for(RelationToValueEdge rtvEdge : vNode.getRtvEdges()) {
                if(rtvEdge.getIcmSet().size() > icmSum) {
                    System.out.println("66666666666");
                    System.out.println("relationNode loc: "+rtvEdge.getStarter().getLoc());
                }
                if(rtvEdge.getIcmSet().size() == 0) {
                    System.out.println("66666666666");
                    System.out.println("relationNode loc: "+rtvEdge.getStarter().getLoc());
                }
            }
        }
    }

    private void scanToValidateData() {
        for(int i=0;i<classNodeList.size();i++) {
            ClassNode cNode = classNodeList.get(i);
            if(cNode.getIcmSet().size()>0) {
                System.out.println("class节点编号: "+i+" ,用户数: "+cNode.getIcmSet().size());
                for(ClassToValueEdge ctvEdge : cNode.getCtvEdges()) {
                    if(ctvEdge.getIcmSet().size()==0) continue;
                    System.out.println("指向的value节点为: "+ ctvEdge.getEnder().getName() + " ,其对应用户数为: " +
                            ctvEdge.getIcmSet().size()+" ,该value节点用户数: " + ctvEdge.getEnder().getIcmSet().size());
//                    if(ctvEdge.getIcmSet().size() > max) {
//                        max= ctvEdge.getIcmSet().size();
//                        vNode = ctvEdge.getEnder();
//                    }
                }

            }
        }
        for(int i=0;i<relationNodeList.size();i++) {
            RelationNode rNode = relationNodeList.get(i);
            if(rNode.getIcmSet().size()>0) System.out.println("relation节点编号: "+i+" ,用户数: "+rNode.getIcmSet().size());
        }
    }

    private void sortTheUNameKeyList(List<String> uNameKeyList,Set<Long> icmSet,Map<String,Set<Long>> userSetMap) {
        List<Long> icmList = new ArrayList<>(icmSet);
        Collections.sort(icmList, new Comparator<Long>() {
            @Override
            public int compare(Long o1, Long o2) {
                return o1.compareTo(o2);
            }
        });
        for(int i=0;i<icmList.size();i++) {
            Long curIcm = icmList.get(i);
            for(String key : userSetMap.keySet()) {
                Set<Long> innerUSet = userSetMap.get(key);
                if(innerUSet.contains(curIcm)) {
                    if(!uNameKeyList.contains(key))uNameKeyList.add(key);
                    break;
                }
            }
        }
    }

}
